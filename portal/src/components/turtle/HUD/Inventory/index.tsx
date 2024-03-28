import styled from 'styled-components';
import {Col, Row} from 'react-bootstrap';
import './Inventory.css';
import Item from './Item';
import {useTurtle} from '../../../../api/UseTurtle';
import {useParams} from 'react-router-dom';
import {useWebSocket} from '../../../../api/UseWebSocket';
import {useState} from 'react';
import TransferModal from './TransferModal';

type ItemTransfer = {
    fromSide: string;
    fromSlot: number;
    toSlot: number;
    itemName: string;
    maxAmount: number;
    isFormValidated: boolean;
};

function Inventory() {
    const {serverId, id} = useParams() as {serverId: string; id: string};
    const {action} = useWebSocket();
    const {data: turtle} = useTurtle(serverId, id);
    const [itemTransfer, setItemTransfer] = useState<ItemTransfer | null>(null!);

    if (turtle == null) {
        return null;
    }

    const {inventory, selectedSlot} = turtle;
    const transfer = (fromSide: string, fromSlot: number, toSlot: number, count?: number) => {
        if (fromSide === '') {
            // This is an internal item transfer within the Turtle
            action({
                type: 'ACTION',
                action: 'inventory-transfer',
                data: {
                    serverId,
                    id: turtle.id,
                    fromSlot,
                    toSlot,
                    count,
                },
            });
        } else {
            // This is an external item transfer from a nearby peripheral
            action({
                type: 'ACTION',
                action: 'inventory-push-items',
                data: {
                    serverId,
                    id: turtle.id,
                    fromSide,
                    toSide: '',
                    fromSlot,
                    toSlot,
                    count,
                },
            });
        }
    };

    return (
        <>
            <TransferModal
                itemTransfer={itemTransfer}
                hideModal={() => setItemTransfer(null)}
                isFormValidated={itemTransfer?.isFormValidated ?? false}
                handleFormSubmit={(e: React.FormEvent<HTMLFormElement>, amount: number) => {
                    e.preventDefault();
                    if (itemTransfer == null) return;

                    const form = e.currentTarget;
                    if (form.checkValidity() === true) {
                        if (amount > 0) {
                            transfer(itemTransfer.fromSide, itemTransfer.fromSlot, itemTransfer.toSlot, amount);
                        }

                        setItemTransfer(null);
                    } else {
                        setItemTransfer({
                            ...itemTransfer,
                            isFormValidated: true,
                        });
                        e.stopPropagation();
                    }
                }}
            />
            <Row data-bs-theme='light'>
                <Col key='inventory-grid' md='auto'>
                    <div className='inventory-container'>
                        <InventoryGrid>
                            <ButtonSlot style={{gridColumn: 'span 3'}} key='craft-btn'>
                                <button
                                    className='text-muted inventory-button'
                                    onClick={() =>
                                        action({type: 'ACTION', action: 'craft', data: {serverId, id: turtle.id}})
                                    }
                                    disabled={!turtle.isOnline || !turtle.location || !turtle.direction}
                                >
                                    <b>Craft</b>
                                </button>
                            </ButtonSlot>
                            <ButtonSlot key='drop-btn'>
                                <button
                                    className='text-danger inventory-button'
                                    onClick={() =>
                                        action({type: 'ACTION', action: 'drop', data: {serverId, id: turtle.id}})
                                    }
                                    disabled={!turtle.isOnline || !turtle.location || !turtle.direction}
                                >
                                    <b>Drop</b>
                                </button>
                            </ButtonSlot>
                            {Array.from(Array(16), (_, i) => i).map((i) => {
                                const itemIndex = i + 1;
                                const itemDetail = inventory?.[itemIndex];
                                const isEmpty = itemDetail == null;

                                return (
                                    <Item
                                        key={itemIndex}
                                        displayName={isEmpty ? 'Empty' : itemDetail.displayName}
                                        isSelected={itemIndex === selectedSlot}
                                        index={itemIndex}
                                        side=''
                                        item={isEmpty ? null : {name: itemDetail.name, count: itemDetail.count}}
                                        onDrop={(
                                            shiftKey: boolean,
                                            fromSide: string,
                                            fromSlot: number,
                                            toSlot: number,
                                            item?: {
                                                name: string;
                                                amount: number;
                                            }
                                        ) => {
                                            if (item == null) return;
                                            if (shiftKey && item.amount > 1) {
                                                setItemTransfer({
                                                    fromSide,
                                                    fromSlot,
                                                    toSlot,
                                                    itemName: item.name,
                                                    maxAmount: item.amount,
                                                    isFormValidated: false,
                                                });
                                            } else {
                                                transfer(fromSide, fromSlot, toSlot);
                                            }
                                        }}
                                        onClick={() => {
                                            action({
                                                type: 'ACTION',
                                                action: 'select',
                                                data: {serverId, id: turtle.id, slot: itemIndex},
                                            });
                                        }}
                                    />
                                );
                            })}
                        </InventoryGrid>
                    </div>
                </Col>
            </Row>
        </>
    );
}

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

export default Inventory;
