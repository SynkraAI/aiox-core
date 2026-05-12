#!/bin/bash
# DeepSeek Usage Tracker Proxy Manager
# Start/stop the tracking proxy server

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TRACKER_SCRIPT="$SCRIPT_DIR/../usage-tracker/index.js"
PROXY_PORT=8787
PID_FILE="/tmp/deepseek-proxy.pid"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found in PATH"
    exit 1
fi

case "$1" in
    start)
        echo "Starting DeepSeek Usage Tracker Proxy..."
        if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
            echo "Proxy already running (PID: $(cat $PID_FILE))"
            exit 0
        fi
        nohup node "$TRACKER_SCRIPT" start --port=$PROXY_PORT --alias=claude-free > /tmp/deepseek-proxy.log 2>&1 &
        echo $! > "$PID_FILE"
        sleep 1
        if curl -s "http://127.0.0.1:$PROXY_PORT/health" > /dev/null 2>&1; then
            echo "Proxy started on port $PROXY_PORT (PID: $(cat $PID_FILE))"
        else
            echo "Failed to start proxy. Check /tmp/deepseek-proxy.log"
        fi
        ;;

    stop)
        echo "Stopping proxy..."
        if [ -f "$PID_FILE" ]; then
            kill $(cat "$PID_FILE") 2>/dev/null
            rm -f "$PID_FILE"
            echo "Proxy stopped."
        else
            # Try to find and kill by port
            pkill -f "usage-tracker.*--port=$PROXY_PORT" 2>/dev/null
            echo "Proxy stopped."
        fi
        ;;

    status)
        if curl -s "http://127.0.0.1:$PROXY_PORT/health" > /dev/null 2>&1; then
            echo -e "\033[0;92mProxy is running on port $PROXY_PORT\033[0m"
            curl -s "http://127.0.0.1:$PROXY_PORT/health" | jq . 2>/dev/null || curl -s "http://127.0.0.1:$PROXY_PORT/health"
        else
            echo -e "\033[0;93mProxy is not running\033[0m"
        fi
        ;;

    *)
        echo "DeepSeek Usage Tracker Proxy"
        echo ""
        echo "Usage:"
        echo "  deepseek-proxy start   Start the proxy server"
        echo "  deepseek-proxy stop    Stop the proxy server"
        echo "  deepseek-proxy status  Check if proxy is running"
        echo ""
        echo "The proxy runs on port $PROXY_PORT by default."
        ;;
esac
