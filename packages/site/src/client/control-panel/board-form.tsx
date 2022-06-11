import { Button, FormControl, FormErrorMessage, Input, Stack } from "@chakra-ui/react";
import { FormikHelpers, useFormik } from "formik";
import React, { useCallback, useContext } from "react";
import { number, object } from "yup";
import { reactContext } from "../modules/context";

interface BoardFormProps {}

interface FormValues {
    amount: string;
    blocks: string;
}

const initialValues: FormValues = { amount: "", blocks: "" };

const validationSchema = object({
    amount: number().required().positive(),
    blocks: number().required().positive().integer().max(255),
});

export const BoardForm = ({}: BoardFormProps) => {
    const dogecoaster = useContext(reactContext)?.dogecoaster;

    const onSubmit = useCallback(
        async (values: FormValues, actions: FormikHelpers<FormValues>) => {
            if (dogecoaster == undefined) {
                console.error("Cannot board Dogecoaster. blockchain is undefined.");
                return;
            }

            const amount = Number.parseFloat(values.amount);
            const blocks = Number.parseInt(values.blocks);

            if (isNaN(amount)) {
                console.error("Cannot board dogecoaster. amount is not a number.");
                return;
            }

            if (isNaN(blocks)) {
                console.error("Cannot board dogecoaster. blocks is not a number.");
                return;
            }

            await dogecoaster.board(amount, blocks);
            actions.setSubmitting(false);
        },
        [dogecoaster],
    );

    const formik = useFormik({ initialValues, validationSchema, onSubmit });

    return (
        <form onSubmit={formik.handleSubmit}>
            <Stack direction="row">
                <FormControl isInvalid={formik.touched.amount && formik.errors.amount != undefined} width={240}>
                    <Input placeholder="Amount" {...formik.getFieldProps("amount")} />
                    <FormErrorMessage>{formik.errors.amount}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={formik.touched.blocks && formik.errors.blocks != undefined} width={240}>
                    <Input placeholder="Blocks" {...formik.getFieldProps("blocks")} />
                    <FormErrorMessage>{formik.errors.blocks}</FormErrorMessage>
                </FormControl>
                <Button isLoading={formik.isSubmitting} type="submit">
                    Let it ride!
                </Button>
            </Stack>
        </form>
    );
};
