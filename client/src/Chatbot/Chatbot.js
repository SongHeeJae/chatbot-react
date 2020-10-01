import React, { useEffect } from 'react';
import Axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { saveMessage } from '../_actions/message_actions';
import Message from './Section/Message';
import { List, Icon, Avatar } from 'antd';
import Card from './Section/CardComponent';
function Chatbot() {
    const dispatch = useDispatch();
    const messagesFromRedux = useSelector((state) => state.message.messages);

    useEffect(() => {
        eventQuery('welcomeToMyWebsite');
    }, []);

    const textQuery = async (text) => {
        // 보낸 메시지 처리
        let conversation = {
            who: 'user',
            content: {
                text: {
                    text: text,
                },
            },
        };
        dispatch(saveMessage(conversation));

        // 챗봇이 보낸 메시지 처리
        const textQueryVariable = {
            text,
        };
        try {
            // send request to the textQuery route
            const response = await Axios.post(
                '/api/dialogflow/textQuery',
                textQueryVariable,
            );

            for (let content of response.data.fulfillmentMessages) {
                conversation = {
                    who: 'bot',
                    content: content,
                };
                dispatch(saveMessage(conversation));
            }
        } catch (error) {
            conversation = {
                who: 'bot',
                content: {
                    text: {
                        text: 'Error just occured, please check the problem',
                    },
                },
            };
            dispatch(saveMessage(conversation));
        }
    };

    const eventQuery = async (event) => {
        // 챗봇이 보낸 메시지 처리
        const eventQueryVariable = {
            event,
        };
        try {
            // send request to the textQuery route
            const response = await Axios.post(
                '/api/dialogflow/eventQuery',
                eventQueryVariable,
            );

            for (let content of response.data.fulfillmentMessages) {
                let conversation = {
                    who: 'bot',
                    content: content,
                };
                dispatch(saveMessage(conversation));
            }
        } catch (error) {
            let conversation = {
                who: 'bot',
                content: {
                    text: {
                        text: 'Error just occured, please check the problem',
                    },
                },
            };
            dispatch(saveMessage(conversation));
        }
    };

    const keyPressHandler = (e) => {
        if (e.key === 'Enter') {
            if (!e.target.value) {
                return alert('you nned to type something first');
            }

            // we will send request to text query route
            textQuery(e.target.value);

            e.target.value = '';
        }
    };

    const renderCards = (cards) => {
        return cards.map((card, i) => (
            <Card key={i} cardInfo={card.structValue} />
        ));
    };

    const renderOneMessage = (message, i) => {

        if (
            message.content &&
            message.content.text &&
            message.content.text.text
        ) {
            return (
                <Message
                    key={i}
                    who={message.who}
                    text={message.content.text.text}
                />
            );
        } else if (message.content && message.content.payload.fields.card) {

            console.log(message.content.payload.fields.card.listValue.values)

            const AvatarSrc =
                message.who === 'bot' ? (
                    <Icon type="robot" />
                ) : (
                    <Icon type="smile" />
                );

            return (
                <List.Item key={i} style={{ padding: '1rem' }}>
                    <List.Item.Meta
                        avatar={<Avatar icon={AvatarSrc} />}
                        title={message.who}
                        description={renderCards(
                            message.content.payload.fields.card.listValue.values,
                        )}
                    />
                </List.Item>
            );
        }
    };

    const renderMessage = (returnedMessages) => {
        if (returnedMessages) {
            return returnedMessages.map((message, i) => {
                return renderOneMessage(message, i);
            });
        } else {
            return null;
        }
    };

    return (
        <div
            style={{
                height: 700,
                width: 700,
                border: '3px solid black',
                borderRadius: '7px',
            }}
        >
            <div style={{ height: 644, width: '100%', overflow: 'auto' }}>
                {renderMessage(messagesFromRedux)}
            </div>

            <input
                style={{
                    margin: 0,
                    width: '100%',
                    height: 50,
                    borderRadius: '4px',
                    padding: '5px',
                    fontSize: '1rem',
                }}
                placeholder="Send a message..."
                onKeyPress={keyPressHandler}
                type="text"
            />
        </div>
    );
}

export default Chatbot;
