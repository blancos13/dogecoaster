import { Button, Input, Stack } from "@chakra-ui/react";
import React, { ChangeEvent, FormEvent, useCallback, useMemo, useState } from "react";

interface InputRowProps {
    onSubmit: (message: string) => void;
}

export function InputRow({ onSubmit }: InputRowProps) {
    const [inputValue, setInputValue] = useState("");
    const isSubmittable = useMemo(() => inputValue.trim() !== "", [inputValue]);

    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.currentTarget.value);
    }, []);

    const handleSubmit = useCallback(
        (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (!isSubmittable) {
                return;
            }

            onSubmit(inputValue);
            setInputValue("");
        },
        [inputValue, onSubmit],
    );

    return (
        <form onSubmit={handleSubmit}>
            <Stack direction="row">
                <Input onChange={handleChange} value={inputValue} />
                <Button disabled={!isSubmittable}>Send</Button>
            </Stack>
        </form>
    );
}
