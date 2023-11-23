import {useState} from 'react';
import {Modal, Form, Button, InputGroup} from 'react-bootstrap';
import {Action, Turtle} from '../../App';

export interface LocationModalProps {
    turtle: Turtle;
    action: Action;
    hideModal: () => void;
}

function LocationModal(props: LocationModalProps) {
    const [state, setState] = useState({
        isFormValidated: false,
        location: {
            x: props.turtle?.location?.x,
            y: props.turtle?.location?.y,
            z: props.turtle?.location?.z,
        },
        direction: props.turtle?.direction,
    });

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.currentTarget;
        if (form.checkValidity() === true) {
            props.action({
                type: 'ACTION',
                action: 'update-location',
                data: {id: props.turtle.id, location: state.location, direction: Number(state.direction)},
            });
            props.hideModal();
        } else {
            e.stopPropagation();
        }

        setState({
            ...state,
            isFormValidated: true,
        });
    };

    return (
        <Form noValidate validated={state.isFormValidated} onSubmit={handleFormSubmit}>
            <Modal.Header closeButton>
                <Modal.Title>Update Turtle Location</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className='mb-2'>
                    <Form.Label>Location (x, y, z)</Form.Label>
                    <InputGroup>
                        <Form.Control
                            type='number'
                            placeholder={'X'}
                            value={state.location.x}
                            required
                            onChange={(e) =>
                                setState({
                                    ...state,
                                    location: {
                                        ...state.location,
                                        x: Number(e.target.value),
                                    },
                                })
                            }
                        />
                        <Form.Control
                            type='number'
                            placeholder={'Y'}
                            value={state.location.y}
                            required
                            onChange={(e) =>
                                setState({
                                    ...state,
                                    location: {
                                        ...state.location,
                                        y: Number(e.target.value),
                                    },
                                })
                            }
                        />
                        <Form.Control
                            type='number'
                            placeholder={'Z'}
                            value={state.location.z}
                            required
                            onChange={(e) =>
                                setState({
                                    ...state,
                                    location: {
                                        ...state.location,
                                        z: Number(e.target.value),
                                    },
                                })
                            }
                        />
                        <Form.Control.Feedback type='invalid'>Please enter valid numbers</Form.Control.Feedback>
                    </InputGroup>
                </Form.Group>
                <Form.Group className='mb-2'>
                    <Form.Label>Direction</Form.Label>
                    <InputGroup>
                        <Form.Control
                            value={state.direction}
                            onChange={(e) => setState({...state, direction: Number(e.target.value)})}
                            as='select'
                            required
                        >
                            <option value='' key='empty'>
                                -- select facing direction --
                            </option>
                            <option value='2' key=''>
                                (N)orth
                            </option>
                            <option value='3' key=''>
                                (E)ast
                            </option>
                            <option value='4' key=''>
                                (S)outh
                            </option>
                            <option value='1' key=''>
                                (W)est
                            </option>
                        </Form.Control>
                        <Form.Control.Feedback type='invalid'>
                            Please select a valid facing direction
                        </Form.Control.Feedback>
                    </InputGroup>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant='success' type='submit'>
                    Update
                </Button>
            </Modal.Footer>
        </Form>
    );
}

export default LocationModal;
