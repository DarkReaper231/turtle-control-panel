import styled from 'styled-components';
import {OverlayTrigger, Tooltip, Col, Row, Button, Modal} from 'react-bootstrap';
import FarmModal from './FarmModal';
import MineModal from './MineModal';
import SpriteTable from '../../SpriteTable';
import {useState} from 'react';
import './Inventory.css';
import {Action, Areas, Turtle, Turtles} from '../../App';
import TurtleMap from './TurtleMap';

export interface InventoryProps {
    turtles: Turtles;
    turtle: Turtle;
    areas: Areas;
    action: Action;
}

const canvasSize = 208;
const canvasRadius = 0.5 * canvasSize;

function Inventory(props: InventoryProps) {
    const {turtles, turtle, areas, action} = props;
    const [state, setState] = useState<{isModalShown: boolean; modalState: string | undefined}>({
        isModalShown: false,
        modalState: undefined,
    });

    const renderModal = (turtle: Turtle) => {
        switch (state.modalState) {
            case 'farm':
                return (
                    <FarmModal
                        turtle={turtle}
                        action={action}
                        areas={areas}
                        hideModal={() => setState({...state, isModalShown: false})}
                    />
                );
            case 'mine':
                return (
                    <MineModal
                        turtle={turtle}
                        action={action}
                        areas={areas}
                        hideModal={() => setState({...state, isModalShown: false})}
                    />
                );
            default:
                return undefined;
        }
    };

    if (turtle === undefined) {
        return null;
    }

    const {inventory, selectedSlot} = turtle;
    return (
        <Row data-bs-theme='light'>
            <Col key='inventory-grid' md='auto'>
                <Modal show={state.isModalShown} onHide={() => setState({...state, isModalShown: false})}>
                    {renderModal(turtle)}
                </Modal>
                <div className='inventory-container'>
                    <InventoryGrid>
                        <ButtonSlot key='refresh-btn'>
                            <button
                                className='text-muted inventory-button'
                                onClick={() =>
                                    props.action({type: 'ACTION', action: 'refresh-inventory', data: {id: turtle.id}})
                                }
                                disabled={!turtle.isOnline || !turtle.location || !turtle.direction}
                            >
                                <b>Refresh</b>
                            </button>
                        </ButtonSlot>
                        <ButtonSlot style={{gridColumn: 'span 2'}} key='craft-btn'>
                            <button
                                className='text-muted inventory-button'
                                onClick={() => props.action({type: 'ACTION', action: 'craft', data: {id: turtle.id}})}
                                disabled={!turtle.isOnline || !turtle.location || !turtle.direction}
                            >
                                <b>Craft</b>
                            </button>
                        </ButtonSlot>
                        <ButtonSlot key='drop-btn'>
                            <button
                                className='text-danger inventory-button'
                                onClick={() => props.action({type: 'ACTION', action: 'drop', data: {id: turtle.id}})}
                                disabled={!turtle.isOnline || !turtle.location || !turtle.direction}
                            >
                                <b>Drop</b>
                            </button>
                        </ButtonSlot>
                        {Array.from(Array(16), (_, i) => i).map((i) => {
                            const itemIndex = i + 1;
                            const ItemSlotStyle = itemIndex === selectedSlot ? SelectedItemSlot : ItemSlot;
                            const itemDetail = inventory[itemIndex];
                            if (itemDetail === null || itemDetail === undefined) {
                                return (
                                    <OverlayTrigger
                                        key={i}
                                        placement='top'
                                        overlay={<Tooltip data-bs-theme='light'>Empty</Tooltip>}
                                    >
                                        <ItemSlotStyle
                                            data-inventory-slot={itemIndex}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                const toSlot = (e.target as HTMLBaseElement)?.dataset?.inventorySlot;
                                                const fromSlot = e.dataTransfer.getData('fromSlot');
                                                if (fromSlot && toSlot && fromSlot !== toSlot) {
                                                    props.action({
                                                        type: 'ACTION',
                                                        action: 'inventory-transfer',
                                                        data: {
                                                            id: turtle.id,
                                                            fromSlot,
                                                            toSlot,
                                                        },
                                                    });
                                                }
                                            }}
                                            onClick={() => {
                                                props.action({
                                                    type: 'ACTION',
                                                    action: 'select',
                                                    data: {id: turtle.id, slot: itemIndex},
                                                });
                                            }}
                                        >
                                            <EmptyItemImage data-inventory-slot={itemIndex} />
                                        </ItemSlotStyle>
                                    </OverlayTrigger>
                                );
                            }

                            const {name, count, displayName} = itemDetail;
                            const sprite = SpriteTable[name] ?? SpriteTable['???'];
                            const spriteY = 32 * Math.floor(sprite.index / 32);
                            const spriteX = 32 * (sprite.index - spriteY - 1);

                            return (
                                <OverlayTrigger
                                    key={i}
                                    placement='top'
                                    overlay={<Tooltip data-bs-theme='light'>{displayName}</Tooltip>}
                                >
                                    <ItemSlotStyle
                                        draggable
                                        data-inventory-slot={itemIndex}
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData('fromSlot', itemIndex.toString());
                                        }}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            const toSlot = (e.target as HTMLBaseElement)?.dataset?.inventorySlot;
                                            const fromSlot = e.dataTransfer.getData('fromSlot');
                                            if (fromSlot && toSlot && fromSlot !== toSlot) {
                                                props.action({
                                                    type: 'ACTION',
                                                    action: 'inventory-transfer',
                                                    data: {
                                                        id: turtle.id,
                                                        fromSlot,
                                                        toSlot,
                                                    },
                                                });
                                            }
                                        }}
                                        onClick={() => {
                                            props.action({
                                                type: 'ACTION',
                                                action: 'select',
                                                data: {id: turtle.id, slot: itemIndex},
                                            });
                                        }}
                                    >
                                        <ItemImage
                                            data-inventory-slot={itemIndex}
                                            style={{
                                                backgroundImage: 'url(/sprites.png)',
                                                backgroundPosition: `-${spriteX}px -${spriteY}px`,
                                            }}
                                        />
                                        <ItemCount data-inventory-slot={itemIndex}>{count}</ItemCount>
                                    </ItemSlotStyle>
                                </OverlayTrigger>
                            );
                        })}
                    </InventoryGrid>
                </div>
            </Col>
            <Col key='inventory-actions'>
                <Row>
                    <h5>
                        Activity: <ins style={{textTransform: 'capitalize'}}>{turtle?.state?.name || 'idle'}</ins>
                        {turtle?.state?.error ? (
                            <span>
                                {' '}
                                (<span className='text-danger'>{turtle.state.error}</span>)
                            </span>
                        ) : null}
                    </h5>
                </Row>
                <Row>
                    <div>
                        <Button
                            onClick={() => setState({...state, isModalShown: true, modalState: 'mine'})}
                            variant='outline-info'
                            size='sm'
                            disabled={!turtle.isOnline || !turtle.location || !turtle.direction}
                        >
                            Mine
                        </Button>
                    </div>
                </Row>
                <Row style={{marginTop: 5}}>
                    <div>
                        <Button
                            onClick={() => setState({...state, isModalShown: true, modalState: 'farm'})}
                            variant='outline-info'
                            size='sm'
                            disabled={!turtle.isOnline || !turtle.location || !turtle.direction}
                        >
                            Farm
                        </Button>
                    </div>
                </Row>
                <Row style={{marginTop: 5}}>
                    <div>
                        <Button
                            onClick={() => props.action({type: 'ACTION', action: 'refuel', data: {id: turtle.id}})}
                            variant='outline-info'
                            size='sm'
                            disabled={!turtle.isOnline}
                        >
                            Refuel
                        </Button>
                    </div>
                </Row>
                <Row style={{marginTop: 5}}>
                    <div>
                        <Button
                            onClick={() => props.action({type: 'ACTION', action: 'scan', data: {id: turtle.id}})}
                            variant='outline-info'
                            size='sm'
                            disabled={!turtle.isOnline}
                        >
                            Scan
                        </Button>
                    </div>
                </Row>
                <Row style={{marginTop: 10}}>
                    <div>
                        <Button
                            onClick={() => props.action({type: 'ACTION', action: 'stop', data: {id: turtle.id}})}
                            variant='outline-danger'
                            size='sm'
                            disabled={!turtle.isOnline}
                        >
                            Stop
                        </Button>
                    </div>
                </Row>
            </Col>
            <TurtleMap
                style={{border: '1px solid #fff', borderRadius: canvasRadius}}
                canvasSize={canvasSize}
                turtles={turtles}
                areas={areas}
                action={action}
            />
        </Row>
    );
}

const ItemCount = styled.span`
    position: absolute;
    bottom: 0;
    right: 0;
    font-size: 24px;
    line-height: 24px;
    user-select: none;
`;

const EmptyItemImage = styled.span`
    width: 32px;
    height: 32px;
    background-color: #8b8b8b;
`;

const ItemImage = styled.span`
    image-rendering: crisp-edges;
    width: 32px;
    height: 32px;
    display: inline-block;
    background-repeat: no-repeat;
`;

const InventoryGrid = styled.div`
    width: 276px;
    display: inline-grid;
    grid-template-rows: auto auto auto auto;
    grid-template-columns: auto auto auto auto;
    grid-gap: 2px;
`;

const ButtonSlot = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2px;
    width: 64px;
    height: 40px;
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

const SelectedItemSlot = styled(ItemSlot)`
    border: 3px solid #264d8c;
`;

export default Inventory;
