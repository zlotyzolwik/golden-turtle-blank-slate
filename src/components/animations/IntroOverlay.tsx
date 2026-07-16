import { useCallback, useEffect, useRef, useState } from "react";

const INTRO_VIDEO_WEBM = "/intro/turtle-intro.webm";
const INTRO_VIDEO_MP4 = "/intro/turtle-intro.mp4";
const INTRO_FRAME = "/intro/intro-frame.html";
const INTRO_POSTER = "/intro/poster.jpg";

const EXIT_TRANSITION_MS = 3300;
const REDUCED_MOTION_MS = 500;
const GIF_PLAY_MS = 5800;
const MAX_INTRO_MS = 8500;

type IntroPhase = "playing" | "exit" | "hidden";
type MediaMode = "video" | "gif";

const isRealVideoResponse = (response: Response) => {
  if (!response.ok) return false;
  const contentType = response.headers.get("content-type") ?? "";
  return contentType.startsWith("video/");
};

const IntroOverlay = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const exitStartedRef = useRef(false);
  const playTimerRef = useRef<number>();
  const failsafeTimerRef = useRef<number>();
  const [phase, setPhase] = useState<IntroPhase>("playing");
  const [mediaMode, setMediaMode] = useState<MediaMode>("gif");
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const startExit = useCallback(() => {
    if (exitStartedRef.current) return;
    exitStartedRef.current = true;
    window.clearTimeout(playTimerRef.current);
    window.clearTimeout(failsafeTimerRef.current);
    setPhase("exit");

    window.setTimeout(() => {
      setPhase("hidden");
      document.body.classList.remove("intro-lock-scroll");
      document.body.classList.add("intro-finished");
    }, EXIT_TRANSITION_MS);
  }, []);

  const scheduleExitAfterPlay = useCallback(() => {
    window.clearTimeout(playTimerRef.current);
    playTimerRef.current = window.setTimeout(startExit, GIF_PLAY_MS);
  }, [startExit]);

  useEffect(() => {
    fetch(INTRO_VIDEO_WEBM, { method: "HEAD" })
      .then((response) => {
        if (isRealVideoResponse(response)) setMediaMode("video");
      })
      .catch(() => {
        /* GIF remains default */
      });
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const prefersReducedMotion = mediaQuery.matches;
    setIsReducedMotion(prefersReducedMotion);
    document.body.classList.add("intro-lock-scroll");

    const handleMediaChange = (event: MediaQueryListEvent) => {
      setIsReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      document.body.classList.remove("intro-lock-scroll");
      mediaQuery.removeEventListener("change", handleMediaChange);
      window.clearTimeout(playTimerRef.current);
      window.clearTimeout(failsafeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;

    if (isReducedMotion) {
      const timer = window.setTimeout(startExit, REDUCED_MOTION_MS);
      return () => window.clearTimeout(timer);
    }

    failsafeTimerRef.current = window.setTimeout(startExit, MAX_INTRO_MS);

    return () => {
      window.clearTimeout(failsafeTimerRef.current);
    };
  }, [isReducedMotion, phase, startExit]);

  useEffect(() => {
    if (isReducedMotion || mediaMode !== "video" || phase !== "playing") return;

    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => startExit();
    const handleError = () => setMediaMode("gif");

    const tryPlay = async () => {
      try {
        await video.play();
      } catch {
        setMediaMode("gif");
      }
    };

    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      void tryPlay();
    } else {
      video.addEventListener("loadeddata", () => void tryPlay(), { once: true });
    }

    return () => {
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };
  }, [isReducedMotion, mediaMode, phase, startExit]);

  const handleIframeLoad = useCallback(() => {
    scheduleExitAfterPlay();
  }, [scheduleExitAfterPlay]);

  useEffect(() => {
    if (isReducedMotion || mediaMode !== "gif" || phase !== "playing") return;

    const iframe = iframeRef.current;
    if (iframe?.contentDocument?.readyState === "complete") {
      scheduleExitAfterPlay();
    }
  }, [isReducedMotion, mediaMode, phase, scheduleExitAfterPlay]);

  if (phase === "hidden") {
    return null;
  }

  return (
    <>
      {/* INTRO OVERLAY START */}
      <div
        className={`intro-overlay ${phase === "exit" ? "intro-exiting" : ""} ${
          isReducedMotion ? "intro-reduced-motion" : ""
        }`}
        aria-hidden="true"
      >
        <div className="intro-overlay__media">
          <div className="intro-overlay__media-inner">
            {!isReducedMotion && mediaMode === "video" ? (
              <video
                ref={videoRef}
                className="intro-overlay__video"
                autoPlay
                muted
                playsInline
                preload="auto"
                poster={INTRO_POSTER}
              >
                <source src={INTRO_VIDEO_WEBM} type="video/webm" />
                <source src={INTRO_VIDEO_MP4} type="video/mp4" />
              </video>
            ) : isReducedMotion ? (
              <div
                className="intro-overlay__gif intro-overlay__gif--poster"
                role="img"
                aria-label="Intro Złoty Żółwik"
                style={{ backgroundImage: `url(${INTRO_POSTER})` }}
              />
            ) : (
              <iframe
                ref={iframeRef}
                src={INTRO_FRAME}
                title="Intro Złoty Żółwik"
                className="intro-overlay__gif"
                tabIndex={-1}
                onLoad={handleIframeLoad}
              />
            )}
          </div>
        </div>
        <div className="intro-overlay__shade" />
      </div>
      {/* INTRO OVERLAY END */}
    </>
  );
};

export default IntroOverlay;
