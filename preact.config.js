export default function (config) {
    if (config.devServer) {
        config.devServer.proxy = {
            '/api/v1': {
                target: 'http://localhost:3000'
            }
        };
    }
}
