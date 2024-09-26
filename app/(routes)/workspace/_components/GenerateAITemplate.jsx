import { Button } from '@/components/ui/button';
import { LayoutGrid, Loader2Icon } from 'lucide-react';
import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { chatSession } from '@/config/GoogleAIModel';

function GenerateAITemplate({ setGenerateAIOutput }) {
    const [open, setOpen] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);

    const GenerateFromAI = async () => {
        setLoading(true);
        const PROMPT = 'Generate template for editor.js in JSON for ' + userInput;

        try {
            const result = await chatSession.sendMessage(PROMPT);
            const responseText = await result.response.text();
            const output = JSON.parse(responseText);

            // Ensure output has required structure
            if (output && output.blocks && Array.isArray(output.blocks)) {
                setGenerateAIOutput(output);
            } else {
                throw new Error('Invalid format: Expected an object with "blocks" property');
            }
        } catch (error) {
            console.error("Error parsing AI response:", error);
            alert("Failed to parse AI response. Please ensure the AI response is in the correct format.");
        } finally {
            setLoading(false);
            setOpen(false);
        }
    }

    return (
        <div>
            <Button variant="outline" className="flex gap-2" onClick={() => setOpen(true)}>
                <LayoutGrid className='h-4 w-4' /> Generate Using AI
            </Button>

            <Dialog open={open}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate Using AI</DialogTitle>
                        <DialogDescription>
                            <div>
                                <h2 className='mt-5'>What do you want to write in the document?</h2>
                                <Input 
                                    placeholder="Ex. Project Idea"
                                    onChange={(event) => setUserInput(event?.target.value)}
                                />
                                <div className='mt-5 flex gap-5 justify-end'>
                                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                                    <Button variant=""
                                        disabled={!userInput || loading}
                                        onClick={GenerateFromAI}>
                                        {loading ? <Loader2Icon className='animate-spin' /> : 'Generate'}
                                    </Button>
                                </div>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default GenerateAITemplate;
