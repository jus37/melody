<template>
    <div>
        <Row>
            <Col span="12">
                <h1>Плейлисты</h1>
            </Col>
            <Col span="12">
                <MyButton @click.native="addPlaylist" class="header-add">Создать плейлист</MyButton>
            </Col>
        </Row>

        <Playlist v-for="playlist in playlists" :key="playlist._id" :playlist="playlist"></Playlist>
    </div>
</template>
<script>
    import Playlist from "./Playlist";
    import MyButton from "../Button"

    export default {
        name: "Playlists",
        components: {Playlist, MyButton},
        data() {
            return {
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
            addPlaylist() {
                this.$router.push('add_playlist')
            }
        }
    }
</script>

<style scoped>

    .header-add {
        float: right;
    }
</style>