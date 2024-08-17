import Match from 'preact-router/match';

export default function Nav({ paths }) {
    const navStyle = {
        display: 'flex',
        justifyContent: 'center',
        margin: '10px 0',
        width: '500px',
        maxWidth: '100%',
    };

    const linkStyle = {
        margin: '0 10px',
        textDecoration: 'none',
        color: 'black',
        padding: '5px',
        borderRadius: '5px',
        backgroundColor: 'lightgray',
    };

    return (
        <nav style={{ ...navStyle }}>
            {
                paths.map((path) => (
                    <Match path={path.path}>
                        {({ matches }) => (
                            <a href={path.path} style={{ fontWeight: matches ? 'bold' : 'normal', ...linkStyle }}>
                                {path.name}
                            </a>
                        )}
                    </Match>
                ))
            }
        </nav>
    );
}
