/* eslint-disable react/no-unknown-property */
import {useMemo} from 'react';
import {Direction, Turtle, useTurtles} from '../../../api/UseTurtle';
import {useAtlasMap} from './TextureAtlas';
import {useParams} from 'react-router-dom';
import Turtle3D from './Turtle3D';

const OtherTurtles = () => {
    const {serverId, id} = useParams() as {serverId: string; id: string};
    const {data: atlasMap} = useAtlasMap();
    const {data: turtles} = useTurtles(serverId);
    const {turtle, otherTurtles} = useMemo(() => {
        if (turtles == null) {
            return {
                turtle: null,
                otherTurtles: [],
            };
        }

        return turtles.reduce(
            (acc, curr) => {
                if (curr.id.toString() === id) {
                    acc.turtle = curr;
                } else {
                    acc.otherTurtles.push(curr);
                }

                return acc;
            },
            {
                turtle: null,
                otherTurtles: [],
            } as {
                turtle: Turtle | null;
                otherTurtles: Turtle[];
            }
        );
    }, [turtles]);

    if (atlasMap == null) return null;
    if (turtle == null) return null;

    const turtleLocation = turtle.location;
    if (turtleLocation == null) return null;

    const turtleRotation = (direction: Direction) => {
        switch (direction) {
            case Direction.North:
                return 0;
            case Direction.East:
                return 1.5 * Math.PI;
            case Direction.South:
                return Math.PI;
            case Direction.West:
                return Math.PI * 0.5;
        }
    };

    return otherTurtles.map((otherTurtle) => {
        const otherTurtleLocation = otherTurtle.location;
        if (otherTurtleLocation == null) return null;

        return (
            <group
                key={otherTurtle.id}
                rotation={[0, turtleRotation(otherTurtle.direction), 0]}
                position={[
                    otherTurtleLocation.x - turtleLocation.x,
                    otherTurtleLocation.y - turtleLocation.y,
                    otherTurtleLocation.z - turtleLocation.z,
                ]}
            >
                <Turtle3D atlasMap={atlasMap} name={otherTurtle.name} />
            </group>
        );
    });
};

export default OtherTurtles;
