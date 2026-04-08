import {Button} from "@/components/shared/button/Button.tsx";

const ToDoView = () => {

    return <>
        <div className="flex flex-col items-center justify-center h-full">
            <div className="w-96 h-96">
            </div>
            <div className="text-2xl font-semibold mt-4">
                To Do View - Coming Soon
            </div>
            <Button variant="plain" className="mt-4" onClick={() => alert('Button clicked!')}>
                Click me
            </Button>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                Card content
            </div>
        </div>
    </>

}

export default ToDoView