import React, { useRef, useState, useEffect } from 'react';

const circleSizeMul = 0.35;
const spriteSize = 10;
const spriteRadius = 0.5 * spriteSize;

const Canvas = (props) => {
    const { canvasSize, turtles, selectedTurtle, world, action, ...rest } = props;
    const canvasRef = useRef(undefined);
    const [mousePosition, setMousePosition] = useState(undefined);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        let animationFrameId;

        const render = () => {
            const draw = (ctx, canvasSize, turtles, selectedTurtle, world) => {
                if (!turtles || !turtles[selectedTurtle] || !world) {
                    return;
                }

                const mul = canvasSize / spriteSize;
                const centerX = 0.5 * spriteSize * mul;
                const centerY = 0.5 * spriteSize * mul;
                const drawRange = 0.5 * mul;
                const turtle = turtles[selectedTurtle];
                const { x, y, z } = turtle.location;

                // Clear
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                ctx.fillStyle = '#323232';

                // Draw floor
                for (let i = -drawRange; i <= drawRange; i++) {
                    for (let j = -drawRange; j <= drawRange; j++) {
                        const wX = x + i;
                        const wZ = z + j;
                        if (world[`${wX},${y - 1},${wZ}`] !== undefined) {
                            ctx.fillRect(
                                (i + drawRange) * spriteSize - spriteRadius,
                                (j + drawRange) * spriteSize - spriteRadius,
                                spriteSize,
                                spriteSize,
                            );
                        }
                    }
                }

                ctx.lineWidth = 1;
                ctx.strokeStyle = 'black';
                ctx.globalAlpha = 0.4;

                // Draw lines
                for (let i = -drawRange; i <= drawRange; i++) {
                    // Horizontal
                    ctx.beginPath();
                    ctx.moveTo(-canvasSize, (i + drawRange) * spriteSize - spriteRadius);
                    ctx.lineTo(canvasSize, (i + drawRange) * spriteSize - spriteRadius);
                    ctx.stroke();

                    // Vertical
                    ctx.beginPath();
                    ctx.moveTo((i + drawRange) * spriteSize - spriteRadius, -canvasSize);
                    ctx.lineTo((i + drawRange) * spriteSize - spriteRadius, canvasSize);
                    ctx.stroke();
                }

                ctx.globalAlpha = 1;

                // Draw currently selected block
                ctx.fillStyle = '#1491a2';
                if (turtle.isOnline && mousePosition !== undefined) {
                    ctx.fillRect(
                        Math.floor((mousePosition[0] - spriteRadius) / spriteSize) * spriteSize + spriteRadius,
                        Math.floor((mousePosition[1] - spriteRadius) / spriteSize) * spriteSize + spriteRadius,
                        spriteSize,
                        spriteSize,
                    );
                }

                ctx.fillStyle = 'black';

                // Draw blocks
                for (let i = -drawRange; i <= drawRange; i++) {
                    for (let j = -drawRange; j <= drawRange; j++) {
                        const wX = x + i;
                        const wZ = z + j;
                        if (world[`${wX},${y},${wZ}`] !== undefined) {
                            ctx.fillRect(
                                (i + drawRange) * spriteSize - spriteRadius,
                                (j + drawRange) * spriteSize - spriteRadius,
                                spriteSize,
                                spriteSize,
                            );
                        }
                    }
                }

                // Draw other turtles
                const keys = Object.keys(turtles);
                for (let key of keys) {
                    if (key !== turtle.id.toString()) {
                        const otherTurtle = turtles[key];
                        if (otherTurtle.location.y === turtle.location.y) {
                            ctx.beginPath();
                            ctx.fillStyle = otherTurtle.isOnline ? 'white' : '#696969';
                            const posX = (otherTurtle.location.x - turtle.location.x) * spriteSize + centerX;
                            const posY = (otherTurtle.location.z - turtle.location.z) * spriteSize + centerY;
                            ctx.arc(posX, posY, circleSizeMul * spriteSize, 0, 2 * Math.PI, false);
                            ctx.fill();

                            ctx.textAlign = 'center';
                            ctx.strokeStyle = 'black';
                            ctx.font = '10px Ariel';
                            ctx.lineWidth = 4;
                            ctx.strokeText(otherTurtle.name, posX, posY - spriteRadius);
                            ctx.fillText(otherTurtle.name, posX, posY - spriteRadius);
                        }
                    }
                }

                // Draw current turtle
                ctx.beginPath();
                ctx.fillStyle = 'yellow';
                ctx.arc(centerX, centerY, circleSizeMul * spriteSize, 0, 2 * Math.PI, false);
                ctx.fill();

                ctx.textAlign = 'center';
                ctx.strokeStyle = 'black';
                ctx.font = '10px Ariel';
                ctx.lineWidth = 4;
                ctx.strokeText(turtle.name, centerX, centerY - spriteRadius);
                ctx.fillText(turtle.name, centerX, centerY - spriteRadius);
            };
            draw(context, canvasSize, turtles, selectedTurtle, world);

            animationFrameId = window.requestAnimationFrame(render);
        };
        render();

        return () => {
            window.cancelAnimationFrame(animationFrameId);
        };
    });

    return (
        <canvas
            ref={canvasRef}
            {...rest}
            height={canvasSize}
            width={canvasSize}
            onMouseMove={(e) => setMousePosition([e.nativeEvent.offsetX, e.nativeEvent.offsetY])}
            onClick={(e) => {
                const turtle = turtles && turtles[selectedTurtle];
                if (turtle && turtle.isOnline) {
                    const { x, y, z } = turtle.location;
                    action({
                        type: 'ACTION',
                        action: 'move',
                        data: {
                            id: turtle.id,
                            x:
                                (Math.floor((e.nativeEvent.offsetX - spriteRadius) / spriteSize) * spriteSize +
                                    spriteRadius +
                                    spriteRadius -
                                    canvasSize * 0.5) /
                                    spriteSize +
                                x,
                            y,
                            z:
                                (Math.floor((e.nativeEvent.offsetY - spriteRadius) / spriteSize) * spriteSize +
                                    spriteRadius +
                                    spriteRadius -
                                    canvasSize * 0.5) /
                                    spriteSize +
                                z,
                        },
                    });
                }
            }}
        />
    );
};

export default Canvas;
