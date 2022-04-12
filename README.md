# Minecraft Server Control Discord Bot Sub Module

This app exposes an API, which can be used to send basic commands to a local [MSCS](https://github.com/MinecraftServerControl/mscs/) installation. It is designed to be used by the [MSCS discord bot](https://github.com/xathon/mscs-discord-bot/). A shared secret is used to prevent unauthorized access.

**WARNING:** Calls made to this API should always be encrypted! You can achieve this by using an SSH tunnel or HTTPS (for this, you could e.g. use Caddy as a reverse proxy). 