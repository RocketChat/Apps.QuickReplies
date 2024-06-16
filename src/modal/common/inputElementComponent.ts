import { InputBlock, InputElementDispatchAction } from "@rocket.chat/ui-kit";
import { QuickRepliesApp } from "../../../QuickRepliesApp";
import { ElementInteractionParam } from "../../definition/ui-kit/Element/IElementBuilder";
import { Modals } from "../../enum/modals/common/Modal";
export function inputElementComponent(
    {
        app,
        placeholder,
        label,
        optional,
        multiline,
        minLength,
        maxLength,
        initialValue,
        dispatchActionConfigOnInput,
    }: {
        app: QuickRepliesApp;
        placeholder: string;
        label: string;
        optional?: boolean;
        multiline?: boolean;
        minLength?: number;
        maxLength?: number;
        initialValue?: string;
        dispatchActionConfigOnInput?: boolean;
    },
    { blockId, actionId }: ElementInteractionParam
): InputBlock {
    const { elementBuilder, blockBuilder } = app.getUtils();
    const dispatchActionConfig: Array<InputElementDispatchAction> = [];
    if (dispatchActionConfigOnInput) {
        dispatchActionConfig.push(Modals.dispatchActionConfigOnInput);
    }
    const plainTextInputElement = elementBuilder.createPlainTextInput(
        {
            text: placeholder,
            multiline,
            minLength,
            maxLength,
            dispatchActionConfig,
            initialValue,
        },
        {
            blockId,
            actionId,
        }
    );

    const plainTextInputBlock = blockBuilder.createInputBlock({
        text: label,
        element: plainTextInputElement,
        optional,
    });

    return plainTextInputBlock;
}
