import { useEffect, useRef } from 'react';

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260601_110537_3a579fa0-7bbc-4d94-9d25-0e816c7840f5.mp4';

export default function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let previousX: number | null = null;
    let targetTime = 0;
    let isSeeking = false;
    let pendingTime: number | null = null;

    const seekTo = (time: number) => {
      if (isSeeking) {
        pendingTime = time;
        return;
      }
      isSeeking = true;
      video.currentTime = time;
    };

    const handleSeeked = () => {
      isSeeking = false;
      targetTime = video.currentTime;
      if (pendingTime !== null) {
        const next = pendingTime;
        pendingTime = null;
        seekTo(next);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (window.innerWidth < 1024) return;
      if (!video.duration) return;

      if (previousX === null) {
        previousX = event.clientX;
        return;
      }

      const deltaX = event.clientX - previousX;
      previousX = event.clientX;

      targetTime += (deltaX / window.innerWidth) * 0.8 * video.duration;
      targetTime = Math.max(0, Math.min(video.duration, targetTime));

      seekTo(targetTime);
    };

    window.addEventListener('mousemove', handleMouseMove);
    video.addEventListener('seeked', handleSeeked);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleMobilePlayback = () => {
      if (window.innerWidth < 1024) {
        video.autoplay = true;
        void video.play();
      }
    };

    handleMobilePlayback();
    window.addEventListener('resize', handleMobilePlayback);

    return () => window.removeEventListener('resize', handleMobilePlayback);
  }, []);

  return (
    <div className="order-last lg:order-none relative lg:absolute lg:inset-0 lg:z-0 overflow-hidden pointer-events-none w-full aspect-square md:aspect-video lg:aspect-auto lg:h-full bg-neutral-50 lg:bg-transparent">
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover object-right lg:object-right-bottom"
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>
    </div>
  );
}
