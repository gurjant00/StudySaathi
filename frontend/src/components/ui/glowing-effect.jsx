import { memo, useCallback, useEffect, useRef, useState } from "react";
import { animate } from "motion/react";

const GlowingEffect = memo(
    ({
        blur = 0,
        inactiveZone = 0.01,
        proximity = 64,
        spread = 40,
        glow = true,
        movementDuration = 2,
        borderWidth = 3,
        disabled = false,
        onClickAnimate = false,
        onAnimationComplete = null,
    }) => {
        const containerRef = useRef(null);
        const lastPosition = useRef({ x: 0, y: 0 });
        const animationFrameRef = useRef(0);
        const [isClickAnimating, setIsClickAnimating] = useState(false);

        const handleMove = useCallback(
            (e) => {
                if (!containerRef.current || isClickAnimating) return;

                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }

                animationFrameRef.current = requestAnimationFrame(() => {
                    const element = containerRef.current;
                    if (!element) return;

                    const { left, top, width, height } = element.getBoundingClientRect();
                    const mouseX = e?.x ?? lastPosition.current.x;
                    const mouseY = e?.y ?? lastPosition.current.y;

                    if (e) {
                        lastPosition.current = { x: mouseX, y: mouseY };
                    }

                    const center = [left + width * 0.5, top + height * 0.5];
                    const distanceFromCenter = Math.hypot(
                        mouseX - center[0],
                        mouseY - center[1]
                    );
                    const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;

                    if (distanceFromCenter < inactiveRadius) {
                        element.style.setProperty("--active", "0");
                        return;
                    }

                    const isActive =
                        mouseX > left - proximity &&
                        mouseX < left + width + proximity &&
                        mouseY > top - proximity &&
                        mouseY < top + height + proximity;

                    element.style.setProperty("--active", isActive ? "1" : "0");

                    if (!isActive) return;

                    const currentAngle =
                        parseFloat(element.style.getPropertyValue("--start")) || 0;
                    let targetAngle =
                        (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) /
                        Math.PI +
                        90;

                    const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
                    const newAngle = currentAngle + angleDiff;

                    animate(currentAngle, newAngle, {
                        duration: movementDuration,
                        ease: [0.16, 1, 0.3, 1],
                        onUpdate: (value) => {
                            if (containerRef.current) {
                                containerRef.current.style.setProperty("--start", String(value));
                            }
                        },
                    });
                });
            },
            [inactiveZone, proximity, movementDuration, isClickAnimating]
        );

        // Click animation: spin the glow 360° around the card
        const triggerClickAnimation = useCallback(() => {
            if (!containerRef.current) return;
            const element = containerRef.current;
            setIsClickAnimating(true);
            element.style.setProperty("--active", "1");

            const currentAngle = parseFloat(element.style.getPropertyValue("--start")) || 0;

            animate(currentAngle, currentAngle + 360, {
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1],
                onUpdate: (value) => {
                    if (containerRef.current) {
                        containerRef.current.style.setProperty("--start", String(value));
                    }
                },
                onComplete: () => {
                    setIsClickAnimating(false);
                    if (onAnimationComplete) {
                        onAnimationComplete();
                    }
                },
            });
        }, [onAnimationComplete]);

        // Expose click trigger
        useEffect(() => {
            if (onClickAnimate) {
                triggerClickAnimation();
            }
        }, [onClickAnimate, triggerClickAnimation]);

        useEffect(() => {
            if (disabled) return;

            const handleScroll = () => handleMove();
            const handlePointerMove = (e) => handleMove(e);

            window.addEventListener("scroll", handleScroll, { passive: true });
            document.body.addEventListener("pointermove", handlePointerMove, { passive: true });

            return () => {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
                window.removeEventListener("scroll", handleScroll);
                document.body.removeEventListener("pointermove", handlePointerMove);
            };
        }, [handleMove, disabled]);

        const gradient = `radial-gradient(circle, #dd7bbb 10%, transparent 20%),
      radial-gradient(circle at 40% 40%, #d79f1e 5%, transparent 15%),
      radial-gradient(circle at 60% 60%, #5a922c 10%, transparent 20%), 
      radial-gradient(circle at 40% 60%, #4c7894 10%, transparent 20%),
      repeating-conic-gradient(
        from 236.84deg at 50% 50%,
        #dd7bbb 0%,
        #d79f1e 5%,
        #5a922c 10%, 
        #4c7894 15%,
        #dd7bbb 20%
      )`;

        return (
            <div
                ref={containerRef}
                style={{
                    '--spread': spread,
                    '--start': '0',
                    '--active': '0',
                    pointerEvents: 'none',
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    overflow: 'hidden',
                }}
            >
                {/* The glow border element */}
                <div
                    style={{
                        position: 'absolute',
                        inset: `-${borderWidth}px`,
                        borderRadius: 'inherit',
                        background: gradient,
                        backgroundAttachment: 'fixed',
                        WebkitMask: `linear-gradient(#000 0 0) content-box, conic-gradient(from calc((var(--start) - var(--spread)) * 1deg), transparent 0deg, #fff calc(var(--spread) * 1deg), #fff calc(var(--spread) * 1deg), transparent calc(var(--spread) * 2deg)) border-box`,
                        mask: `linear-gradient(#000 0 0) content-box, conic-gradient(from calc((var(--start) - var(--spread)) * 1deg), transparent 0deg, #fff calc(var(--spread) * 1deg), #fff calc(var(--spread) * 1deg), transparent calc(var(--spread) * 2deg)) border-box`,
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                        padding: `${borderWidth}px`,
                        opacity: 'var(--active)',
                        transition: 'opacity 0.3s ease',
                        filter: blur > 0 ? `blur(${blur}px)` : 'none',
                    }}
                />
            </div>
        );
    }
);

GlowingEffect.displayName = "GlowingEffect";

export { GlowingEffect };
