import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { addTestMessage } from '../actions'


import { io } from "socket.io-client";

var socket = io("http://localhost:8000").connect();
/*
 * @class TestMessage `新建事项`组件
 */
class TestMessage extends Component {
    constructor(props) {
        super(props);
        this.sendMessage = this.sendMessage.bind(this);
        this.insertMessage = this.insertMessage.bind(this);
        this.addMessage = this.addMessage.bind(this);
        this.updateMessage = this.updateMessage.bind(this);
    }

    componentDidMount() {
        console.log('socketId:————————————' + socket.id);
        socket.on('sendToClientmessage', this.props.updateServerMessageToState);
    }


    sendMessage () {
        this.props.updateMessageToState("sendMessage....");
        socket.emit('send:message', { name: "Michael say Hello" }, function (result) {
            if (!result) {
                return alert('There was an error changing your name');
            }
            console.log("send info");
        });
    }

    insertMessage() {
        this.props.updateMessageToState("insertMessage....");
        socket.emit('intert:message', { name: "Leo say Hello" }, function (result) {
            if (!result) {
                return alert('There was an error changing your name');
            }
            console.log("sendMessage");
        });
    }

    addMessage() {
        this.props.updateMessageToState("addMessage....");
        socket.emit('add:message', { name: "Wang say Hello" }, function (result) {
            if (!result) {
                return alert('There was an error changing your name');
            }
            console.log("addMessage");
        });
    }

    updateMessage() {
        this.props.updateMessageToState("updateMessage....");
        socket.emit('update:message', { name: "Qiang say Hello" }, function (result) {
            if (!result) {
                return alert('There was an error changing your name');
            }
            console.log("updateMessage");
        });
    }

    render() {
        // const { messagelist } = this.props;
        return (
            <div>
                <div> Hello Enbe</div>
                <ul>
                    {
                        this.props.messageList.map((item, i) => {
                            return <li>{i}. {item.message}</li>
                        })
                    }
                </ul>

                <button onClick={this.sendMessage}>用户</button>
                <button onClick={this.insertMessage}>insert</button>
                <button onClick={this.addMessage}>add</button>
                <button onClick={this.updateMessage}>update</button>
                <div id="videoContainer">
                    <video id="localVideo" playsInline autoPlay muted></video>
                    <video id="remoteVideo" playsInline autoPlay></video>
                    <div>
                        <button id="startButton">Start</button>
                        <button id="callButton">Call</button>
                        <button id="upgradeButton">Turn on video</button>
                        <button id="hangupButton">Hang Up</button>
                    </div>
                </div>

            </div>
        );
    }
}

TestMessage.propTypes = {
    messageList: PropTypes.arrayOf(
        PropTypes.shape({
            message: PropTypes.string.isRequired,
        }).isRequired).isRequired,
};
const mapStateToProps = (state) => {
    return { messageList: state.messageList };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateMessageToState: (text) => {
            dispatch(addTestMessage(text));
        },
        updateServerMessageToState: (messageBody) => {
            dispatch(addTestMessage(messageBody.message));
        },

    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TestMessage);
