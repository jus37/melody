<template>
    <div>
        <div class="room_name">
            <h2>Введите название команты</h2>
            <Input v-model="roomName" size="large" placeholder="Название комнаты"></Input>
        </div>

        <div class="playlists"></div>
        <h2>Выберите плейлист</h2>
        <Playlist v-for="p in playlists" :key="p._id"
                  :playlist="p"
                  @click.native="selectPlaylist(p)"
                    :class="{active: p._id === playlist._id}">

        </Playlist>

        <Col span="24" class="create">
            <MyButton @click.native="createRoom" :large="true">Создать</MyButton>
        </Col>

    </div>
</template>

<script>
    import Playlist from "../playlists/Playlist";
    import MyButton from "../Button";

    export default {
        name: "CreateRoom",
        components: {MyButton, Playlist},
        data() {
            return {
                roomName: null,
                playlist: {},
                playlists: []
            }
        },
        created() {
            this.$socket.emit('getPlaylists', null, (data) => {
                this.playlists = data.map((val) => {
                    const idx = val.likes.findIndex(user => user.id === this.user.id);
                    val.like = idx !== -1;
                    return val
                });
            })
        },
        computed: {
          user() {
              return this.$store.state.user
          }
        },
        methods: {
            selectPlaylist(playlist) {
                this.playlist = playlist;
            },
            createRoom() {
                const data = {
                    name: this.roomName,
                    playlistId: this.playlist._id
                };
                this.$socket.emit('createRoom', data, (res) => {
                    this.$router.push('/rooms')
                })
            }
        }
    }
</script>

<style scoped>
    .room_name h2{
        margin-bottom: 10px;
    }

    .playlists {
        margin-top: 25px;
    }

    .active {
        background-color: rgba(0, 0, 0, 0.11) !important;
    }

    .create {
        margin-top: 20px;
        text-align: center;
    }
</style>