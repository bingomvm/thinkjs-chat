<template>
  <div>
    <el-button type="primary" @click="editName">进入聊天室</el-button>
    <div class="content">
      <div v-if="editNickName" class="nickname">
        <div class="nickname-input">
          <input placeholder="请输入您的昵称" ref="nicnameInput" v-model="nickname" @keyup.enter="toRoom" class="nickname-input" type="text">
        </div>
      </div>
      <div v-if="showChat" class="chat">
        <div class="chat-box">
          <div v-for="(item, index) in chatData" :key="index">
            <p v-if="item.type == 'in'" class="enter-tip">{{item.nickname}}进入聊天室</p>
            <p v-if="item.type == 'out'" class="enter-tip">{{item.nickname}}离开聊天室</p>
            <p v-else-if="item.type == 'message'" :class="['message',{'me':item.isMe}]">
              <span v-if="!item.isMe" style="color:red">{{item.nickname}}:</span>
              <span>{{item.message}}</span>
              <span v-if="item.isMe" style="color:red">:{{item.nickname}}</span>
            </p>
          </div>
        </div>
        <div class="chat-input">
          <el-input class="input" v-model="chatMsg"></el-input>
          <el-button class="send-button" @keyup.native.enter="sendMsg" @click="sendMsg">发送</el-button>
        </div>
      </div>
    </div>
    
  </div>
</template>
<script>
import api from '@api';
export default {
  name: 'Index',
  data() {
    return {
      receive: '',
      chatMsg: '',
      nickname: '',
      editNickName: false,
      showChat: false,
      chatData: [],
    };
  },
  mounted() {
    this.initSocket();
  },
  methods: {
    initSocket() {
      this.socket = io();
      this.socket.on('open', data => {
        console.log('open', data)
        this.receive = data;
      })
    },
    initUI() {
      this.receive = '';
      this.chatMsg = '';
      this.nickname = '';
      this.ditNickName = false;
      this.showChat = false;
      this.chatData = [];
    },
    editName() {
      this.initUI();
      if (this.socket) {
        this.socket.emit('close');
        this.socket.off('message');
        this.socket.off('room');
        this.socket.off('close');
      }
      this.editNickName = true;
      this.$nextTick(() => {
        console.log(this.$refs.nicnameInput)
        this.$refs.nicnameInput.focus();
      })
    },
    toRoom() {
      this.editNickName = false;
      this.showChat = true;
      this.socket.emit('room', {
        nickname: this.nickname
      })
      this.socket.on('message', data => {
        this.chatData.push(data);
        if (data.id === this.socket.id) {
          data.isMe = true
        }
        console.log('-->', data);
      })
      this.socket.on('room', (data) => {
        console.log('room data', data)
        this.chatData.push(data);
      })
      this.socket.on('close', (data) => {
        console.log('close data', data)
        this.chatData.push(data);
      })
      console.log('to room', this.nickname)
    },
    sendMsg() {
      if (!this.chatMsg) return this.$message.error('发送内容为空');
      this.socket.emit('message', {
        message: this.chatMsg,
        nickname: this.nickname
      })
      this.chatMsg = '';
    }
  },
};
</script>

<style lang="scss" scoped>
html,
body {
  height: 100%;
  width: 100%;
}
.content {
  width: 500px;
  height: 500px;
  margin: 0 auto;
  border: 1px solid gray;
  display: flex;
  align-items: center;
}
.nickname {
  flex: 1;
  &-input {
    width: 100%;
    box-sizing: border-box;
    display:inline-block;
    height: 50px;
    font-size: 32px;
    padding: 4px 6px;
    text-align: center;
    border:0;
    outline: none;
    &:focus {
      border: 0;
    }
  }
}
.chat {
  width:100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid gray;
  &-box {
    flex:1;
    overflow-y: auto;
    .enter-tip {
      text-align: center;
      display: block;
      font-size: 12px;
      color: #999;
    }
    .message {
      text-align: left;
      margin: 5px 10px;
      display:block;
      &.me {
        text-align: right;
      }
    }
  }
  &-input {
    height: 50px;
    display: flex;
    align-items: center;
    .input {
      flex: 1;
    }
    .send-button {
      width: 100px;
      margin-left: 10px;
    }
  }
}
</style>
