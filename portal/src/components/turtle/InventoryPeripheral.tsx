import styled from 'styled-components';
import {Action, Direction, Turtle} from '../../App';
import {ExternalInventory, useInventories} from '../../api/UseInventories';
import {useParams} from 'react-router-dom';
import Item from './Item';

export interface InventoryPeripheralProps {
    side: string;
    size: number | null;
    connected: boolean;
    turtle: Turtle;
    action: Action;
}

function InventoryPeripheral(props: InventoryPeripheralProps) {
    const {serverId} = useParams() as {serverId: string};
    const {side, turtle, action} = props;
    const {data: externalInventories} = useInventories(serverId);

    const {location, direction} = turtle;
    const {x, y, z} = location;
    const path = (() => {
        if (side === 'top') {
            return `${x},${y + 1},${z}`;
        } else if (side === 'bottom') {
            return `${x},${y - 1},${z}`;
        } else if (side === 'front') {
            switch (direction) {
                case Direction.West:
                    return `${x - 1},${y},${z}`;
                case Direction.North:
                    return `${x},${y},${z - 1}`;
                case Direction.East:
                    return `${x + 1},${y},${z}`;
                case Direction.South:
                    return `${x},${y},${z + 1}`;
            }
        } else if (side === 'back') {
            switch (direction) {
                case Direction.West:
                    return `${x + 1},${y},${z}`;
                case Direction.North:
                    return `${x},${y},${z + 1}`;
                case Direction.East:
                    return `${x - 1},${y},${z}`;
                case Direction.South:
                    return `${x},${y},${z - 1}`;
            }
        } else if (side === 'left') {
            switch (direction) {
                case Direction.West:
                    return `${x},${y},${z + 1}`;
                case Direction.North:
                    return `${x - 1},${y},${z}`;
                case Direction.East:
                    return `${x},${y},${z - 1}`;
                case Direction.South:
                    return `${x + 1},${y},${z}`;
            }
        } else if (side === 'right') {
            switch (direction) {
                case Direction.West:
                    return `${x},${y},${z - 1}`;
                case Direction.North:
                    return `${x + 1},${y},${z}`;
                case Direction.East:
                    return `${x},${y},${z + 1}`;
                case Direction.South:
                    return `${x - 1},${y},${z}`;
            }
        } else {
            return `${x},${y},${z}`;
        }
    })();

    const externalInventory = externalInventories?.[path];

    const renderTiles = (externalInventory: ExternalInventory) => {
        const tiles = [];
        for (let i = 0; i < externalInventory.size; i++) {
            const itemDetail = externalInventory.content[i];
            tiles.push(
                <ItemSlot key={i}>
                    {itemDetail != null ? (
                        <Item key={i} index={i} name={itemDetail.name} count={itemDetail.count} />
                    ) : (
                        <EmptyItemImage data-inventory-slot={i} />
                    )}
                </ItemSlot>
            );
        }

        return tiles;
    };

    return (
        <div className='inventory-container'>
            <InventoryGrid>
                <div
                    className='text-muted'
                    style={{gridColumn: '1/-1', display: 'flex', justifyContent: 'space-between'}}
                >
                    <button
                        className='text-muted inventory-button'
                        onClick={() =>
                            action({
                                type: 'ACTION',
                                action: 'connect-to-inventory',
                                data: {id: turtle.id, side},
                            })
                        }
                        disabled={!turtle.isOnline || !turtle.location || !turtle.direction}
                    >
                        <b>Refresh</b>
                    </button>
                    <div style={{fontWeight: 'bold'}}>
                        Inventory side (<span className='text-primary'>{side}</span>)
                    </div>
                </div>
                {externalInventory !== undefined ? renderTiles(externalInventory) : null}
            </InventoryGrid>
        </div>
    );
}

const InventoryGrid = styled.div`
    display: inline-grid;
    grid-template-columns: auto auto auto auto auto auto auto auto auto;
    grid-gap: 6px;
`;

const ItemSlot = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    cursor: pointer;
    align-items: center;
    background-color: #8b8b8b;
    border: 1px solid #373737;
    padding: 2px;
    width: 64px;
    height: 64px;
`;

const EmptyItemImage = styled.span`
    width: 32px;
    height: 32px;
    background-color: #8b8b8b;
`;

export default InventoryPeripheral;
