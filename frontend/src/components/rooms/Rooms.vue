<template>
    <div>
        <Row v-if="currentRoom.ID">
            <h1>Ваша игра</h1>
            <Room :room="currentRoom" :isCurrentRoom="true"></Room>
        </Row>

        <Row class="rooms">
            <div class="rooms-header">
                <h1>Ожидают игры</h1>
                <MyButton @click.native="createRoom" v-if="!currentRoom.ID" class="create_room">Создать игру</MyButton>
            </div>
            <Room v-for="room in rooms" :room="room" :curent="false" :key="room.ID" v-if="room.ID !== currentRoom.ID"></Room>
        </Row>
    </div>
</template>

<script>
    import Room from "./Room";
    import MyButton from "../Button"

    export default {
        name: "Rooms",
        components: {MyButton, Room},
        data() {
            return {
                currentRoom: {}
            }
        },
        created() {
            this.$socket.emit('getRooms', null, rooms => {
                this.$store.commit('rooms', rooms);
            })
        },
        computed: {
            user() {
                return this.$store.state.user
            },
            rooms() {
                const rooms = this.$store.state.rooms;
                this.currentRoom = {};
                for (let key in rooms) {
                    for (let member of rooms[key].members) {
                        if (member.id === this.user.id) {
                            this.currentRoom = rooms[key];
                            break;
                        }
                    }
                }
                return rooms;
            }
        },
        methods: {
            createRoom() {
                this.$router.push('/create_room')
            }
        }
    }
</script>

<style scoped>
    .rooms {
        margin: 10px 0;
    }

    .rooms-header {
        height: 60px;
    }

    .rooms h1 {
        float: left;
    }

    .create_room {
        float: right;
    }

</style>