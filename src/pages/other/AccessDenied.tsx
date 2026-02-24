
const AccessDenied = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center">
            <div className="mt-10 text-center">
                <h3 className="mb-2">Access Denied!</h3>
                <p className="text-base">
                    You have no permission to visit this page
                </p>
            </div>
        </div>
    )
}

export default AccessDenied
