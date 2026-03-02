import { DotLottiePlayer } from '@dotlottie/react-player';

const ToDoView = () => {

    return <>
        <div className="flex flex-col items-center justify-center h-full">
            <div className="w-96 h-96">
                <DotLottiePlayer
                    src="/coming soon.lottie"
                    autoplay
                    loop
                />
            </div>
            <div className="text-2xl font-semibold mt-4">
                To Do View - Coming Soon
            </div>
        </div>
    </>

}

export default ToDoView