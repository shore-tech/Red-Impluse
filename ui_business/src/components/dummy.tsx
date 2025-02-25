export default function Dummy(props: {isLoggedIn: boolean}) {
    return (
        <div>
            {props.isLoggedIn ? <h1>You Have Logged In</h1> : <h1>Not Logged In Yet</h1>}
        </div>
    )
}