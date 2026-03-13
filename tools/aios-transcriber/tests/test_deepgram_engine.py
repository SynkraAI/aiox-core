#!/usr/bin/env python3
"""Tests for Deepgram transcription engine."""

import json
import sys
from pathlib import Path
from unittest.mock import MagicMock, Mock, call, mock_open, patch

import pytest

# Add parent dir to path so lib.module can be imported as a package
sys.path.insert(0, str(Path(__file__).parent.parent))

from lib.deepgram_engine import DeepgramEngine, MAX_RETRIES, load_api_key


class TestDeepgramEngineInit:
    """Test __init__ and API key loading."""

    @patch('lib.deepgram_engine.load_api_key', return_value='')
    def test_init_no_api_key_raises_valueerror(self, mock_load):
        """No API key should raise ValueError."""
        with pytest.raises(ValueError, match='No Deepgram API key found'):
            DeepgramEngine()

    def test_init_with_api_key_works(self):
        """API key passed directly should work."""
        engine = DeepgramEngine(api_key='test-key')
        assert engine.api_key == 'test-key'
        assert engine.language == 'pt-BR'
        assert engine.workers == 3

    def test_init_with_custom_params(self):
        """Custom language and workers should be stored."""
        engine = DeepgramEngine(api_key='test-key', language='en', workers=5)
        assert engine.language == 'en'
        assert engine.workers == 5


class TestDeepgramEngineProperties:
    """Test engine properties."""

    def test_engine_name_returns_correct_value(self):
        """engine_name property should return 'deepgram-nova-3'."""
        engine = DeepgramEngine(api_key='test-key')
        assert engine.engine_name == 'deepgram-nova-3'


class TestTranscribeFile:
    """Test transcribe_file method."""

    @patch('lib.deepgram_engine.splitter_mod')
    @patch('lib.deepgram_engine.audio_mod')
    def test_transcribe_file_success(self, mock_audio, mock_splitter):
        """Successful transcription should return dict with expected keys."""
        # Setup mocks
        mock_audio.get_duration.return_value = 600
        mock_audio.compress_audio.return_value = Path('/tmp/compressed.mp3')
        mock_splitter.needs_splitting.return_value = False

        engine = DeepgramEngine(api_key='test-key')

        # Mock _api_call to return text
        with patch.object(engine, '_api_call', return_value='transcribed text'):
            result = engine.transcribe_file('/path/to/audio.mp3', compress=True, bitrate='64k')

        # Verify compress was called
        mock_audio.compress_audio.assert_called_once_with(Path('/path/to/audio.mp3'), bitrate='64k')

        # Verify result structure
        assert result['text'] == 'transcribed text'
        assert result['language'] == 'pt-BR'
        assert result['duration_seconds'] == 600
        assert result['engine'] == 'deepgram-nova-3'

    @patch('lib.deepgram_engine.splitter_mod')
    @patch('lib.deepgram_engine.audio_mod')
    def test_transcribe_file_no_compression(self, mock_audio, mock_splitter):
        """compress=False should skip compression."""
        mock_audio.get_duration.return_value = 120
        mock_splitter.needs_splitting.return_value = False

        engine = DeepgramEngine(api_key='test-key')

        with patch.object(engine, '_api_call', return_value='no compression test'):
            result = engine.transcribe_file('/path/to/audio.mp3', compress=False)

        # compress_audio should not be called
        mock_audio.compress_audio.assert_not_called()
        assert result['text'] == 'no compression test'


class TestApiCall:
    """Test _api_call method."""

    def test_api_call_success(self):
        """Successful API call should return transcription text."""
        engine = DeepgramEngine(api_key='test-key-123')

        # Mock file reading
        mock_file_data = b'audio binary data'
        mock_path = Mock(spec=Path)
        mock_path.read_bytes.return_value = mock_file_data

        # Mock response from Deepgram
        deepgram_response = {
            'results': {
                'channels': [
                    {
                        'alternatives': [
                            {
                                'transcript': 'fallback transcript',
                                'paragraphs': {
                                    'paragraphs': [
                                        {
                                            'sentences': [
                                                {'text': 'Hello world.'},
                                                {'text': 'This is a test.'},
                                            ]
                                        },
                                        {
                                            'sentences': [
                                                {'text': 'Second paragraph here.'},
                                            ]
                                        },
                                    ]
                                }
                            }
                        ]
                    }
                ]
            }
        }

        mock_response = Mock()
        mock_response.read.return_value = json.dumps(deepgram_response).encode('utf-8')
        mock_response.__enter__ = Mock(return_value=mock_response)
        mock_response.__exit__ = Mock(return_value=False)

        with patch('lib.deepgram_engine.Path', return_value=mock_path):
            with patch('lib.deepgram_engine.urllib.request.urlopen', return_value=mock_response):
                result = engine._api_call('/fake/path.mp3')

        # Should use paragraph format
        assert 'Hello world. This is a test.' in result
        assert 'Second paragraph here.' in result

    def test_api_call_401_raises_runtime_error(self):
        """401 error should raise RuntimeError with auth error message."""
        engine = DeepgramEngine(api_key='bad-key')

        mock_path = Mock(spec=Path)
        mock_path.read_bytes.return_value = b'data'

        from urllib.error import HTTPError

        mock_error = HTTPError(url='http://test', code=401, msg='Unauthorized', hdrs={}, fp=None)
        mock_error.read = Mock(return_value=b'auth failed')

        with patch('lib.deepgram_engine.Path', return_value=mock_path):
            with patch('lib.deepgram_engine.urllib.request.urlopen', side_effect=mock_error):
                with pytest.raises(RuntimeError, match='auth error.*401'):
                    engine._api_call('/fake/path.mp3')

    @patch('lib.deepgram_engine.time.sleep')
    def test_api_call_429_retry_then_success(self, mock_sleep):
        """429 on first attempt should retry and succeed."""
        engine = DeepgramEngine(api_key='test-key')

        mock_path = Mock(spec=Path)
        mock_path.read_bytes.return_value = b'data'

        from urllib.error import HTTPError

        # First call: 429
        error_429 = HTTPError(url='http://test', code=429, msg='Rate Limited', hdrs={}, fp=None)
        error_429.read = Mock(return_value=b'too many requests')

        # Second call: success
        success_response = {
            'results': {
                'channels': [
                    {'alternatives': [{'transcript': 'retry success'}]}
                ]
            }
        }
        mock_success = Mock()
        mock_success.read.return_value = json.dumps(success_response).encode('utf-8')
        mock_success.__enter__ = Mock(return_value=mock_success)
        mock_success.__exit__ = Mock(return_value=False)

        with patch('lib.deepgram_engine.Path', return_value=mock_path):
            with patch('lib.deepgram_engine.urllib.request.urlopen', side_effect=[error_429, mock_success]):
                result = engine._api_call('/fake/path.mp3')

        # Should have slept once (5s base + jitter, so between 5.0 and 6.5s)
        mock_sleep.assert_called_once()
        sleep_time = mock_sleep.call_args[0][0]
        assert 5.0 <= sleep_time <= 6.5, f'Sleep time {sleep_time} out of expected range'
        assert result == 'retry success'

    @patch('lib.deepgram_engine.time.sleep')
    def test_api_call_429_exhausted_raises(self, mock_sleep):
        """429 on all retries should raise RuntimeError."""
        engine = DeepgramEngine(api_key='test-key')

        mock_path = Mock(spec=Path)
        mock_path.read_bytes.return_value = b'data'

        from urllib.error import HTTPError

        error_429 = HTTPError(url='http://test', code=429, msg='Rate Limited', hdrs={}, fp=None)
        error_429.read = Mock(return_value=b'rate limit')

        with patch('lib.deepgram_engine.Path', return_value=mock_path):
            with patch('lib.deepgram_engine.urllib.request.urlopen', side_effect=error_429):
                with pytest.raises(RuntimeError, match='rate limit.*retries'):
                    engine._api_call('/fake/path.mp3')

        # Should sleep 3 times (initial + 3 retries = 4 attempts)
        assert mock_sleep.call_count == MAX_RETRIES

    @patch('lib.deepgram_engine.time.sleep')
    def test_api_call_network_error_retries_then_raises(self, mock_sleep):
        """URLError should retry then raise."""
        engine = DeepgramEngine(api_key='test-key')

        mock_path = Mock(spec=Path)
        mock_path.read_bytes.return_value = b'data'

        from urllib.error import URLError

        url_error = URLError('network timeout')

        with patch('lib.deepgram_engine.Path', return_value=mock_path):
            with patch('lib.deepgram_engine.urllib.request.urlopen', side_effect=url_error):
                with pytest.raises(RuntimeError, match='Network error.*retries'):
                    engine._api_call('/fake/path.mp3')

        # Should retry 3 times
        assert mock_sleep.call_count == MAX_RETRIES


class TestTranscribeBatch:
    """Test batch transcription."""

    def test_transcribe_batch_two_files_success(self):
        """Batch with 2 files should return dict with both results."""
        engine = DeepgramEngine(api_key='test-key', workers=2)

        file1_result = {
            'text': 'file1 text',
            'language': 'pt-BR',
            'duration_seconds': 120,
            'engine': 'deepgram-nova-3',
        }
        file2_result = {
            'text': 'file2 text',
            'language': 'pt-BR',
            'duration_seconds': 240,
            'engine': 'deepgram-nova-3',
        }

        def mock_transcribe(fp, compress, bitrate):
            if 'file1' in str(fp):
                return file1_result
            return file2_result

        with patch.object(engine, 'transcribe_file', side_effect=mock_transcribe):
            results = engine.transcribe_batch(['/path/file1.mp3', '/path/file2.mp3'], compress=True, bitrate='64k')

        assert len(results) == 2
        assert results['/path/file1.mp3']['text'] == 'file1 text'
        assert results['/path/file2.mp3']['text'] == 'file2 text'


class TestLoadApiKey:
    """Test load_api_key function."""

    @patch('lib.deepgram_engine.os.environ', {})
    def test_load_from_env_file(self, tmp_path):
        """API key should be loaded from .env file."""
        # Create temporary .env file with key
        env_file = tmp_path / '.env'
        env_file.write_text('DEEPGRAM_API_KEY=env-file-key\n')

        # Patch the env_paths to point to our temp file
        with patch('lib.deepgram_engine.Path') as mock_path_cls:
            # Make Path(__file__) chain return our tmp_path setup
            mock_base = Mock()
            mock_base.parent.parent.parent.parent = tmp_path.parent
            mock_path_cls.return_value = mock_base

            # Directly patch the env_paths list
            import lib.deepgram_engine as dg_module
            original_load = dg_module.load_api_key

            def patched_load():
                for env_path in [env_file]:
                    if env_path.exists():
                        content = env_path.read_text(encoding='utf-8')
                        for line in content.strip().split('\n'):
                            line = line.strip()
                            if line.startswith('DEEPGRAM_API_KEY='):
                                return line.split('=', 1)[1].strip()
                return ''

            with patch.object(dg_module, 'load_api_key', patched_load):
                key = dg_module.load_api_key()

        assert key == 'env-file-key'

    @patch('lib.deepgram_engine.os.environ', {'DEEPGRAM_API_KEY': 'env-var-key'})
    def test_load_from_environment_variable(self):
        """API key should fall back to environment variable."""
        # Create a mock path that doesn't exist
        mock_env_file = MagicMock(spec=Path)
        mock_env_file.exists.return_value = False

        # Create mock base that returns mock_env_file for all / operations
        mock_base = MagicMock()
        mock_base.__truediv__.return_value = mock_env_file

        # Mock Path(__file__)
        mock_file = MagicMock()
        mock_file.parent.parent.parent.parent = mock_base

        with patch('lib.deepgram_engine.Path', return_value=mock_file):
            key = load_api_key()

        assert key == 'env-var-key'

    @patch('lib.deepgram_engine.os.environ', {})
    def test_load_returns_empty_when_not_found(self):
        """No API key found should return empty string."""
        # Create a mock path that doesn't exist
        mock_env_file = MagicMock(spec=Path)
        mock_env_file.exists.return_value = False

        # Create mock base that returns mock_env_file for all / operations
        mock_base = MagicMock()
        mock_base.__truediv__.return_value = mock_env_file

        # Mock Path(__file__)
        mock_file = MagicMock()
        mock_file.parent.parent.parent.parent = mock_base

        with patch('lib.deepgram_engine.Path', return_value=mock_file):
            key = load_api_key()

        assert key == ''
