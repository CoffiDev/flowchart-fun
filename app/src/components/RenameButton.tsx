import { t, Trans } from "@lingui/macro";
import produce from "immer";
import { ChangeEvent, ReactNode, useRef, useState } from "react";
import { useMutation } from "react-query";
import { useHistory } from "react-router-dom";

import { isError, slugify, titleToLocalStorageKey } from "../lib/helpers";
import { useIsValidSponsor } from "../lib/hooks";
import { makeChart, renameChart } from "../lib/queries";
import { useRenameDialogStore } from "../lib/renameDialogStore";
import { docToString, useDoc, useDocDetails } from "../lib/useDoc";
import { Box, Type } from "../slang";
import { useSession } from "./AppContext";
import {
  Button,
  Dialog,
  Input,
  Notice,
  Section,
  Tooltip,
  tooltipSize,
} from "./Shared";

export function RenameButton({ children }: { children: ReactNode }) {
  const fullText = useDoc(docToString);
  const isValidSponsor = useIsValidSponsor();
  const session = useSession();
  const initialName = useDocDetails("title", "flowchart-fun");
  const isHosted = useDocDetails("isHosted");
  const id = useDocDetails("id");
  const { push } = useHistory();
  const isOpen = useRenameDialogStore((store) => store.isOpen);
  const convertToHosted = useRenameDialogStore(
    (store) => store.convertToHosted
  );
  const [newName, setName] = useState(initialName);

  const inputRef = useRef<null | HTMLInputElement>(null);
  const rename = useMutation(
    "updateChartName",
    async () => {
      if (isHosted && id && typeof id === "number") {
        await renameChart(id, newName);
      } else if (convertToHosted) {
        if (session?.user?.id) {
          const response = await makeChart({
            name: newName,
            user_id: session?.user?.id,
            chart: fullText,
          });
          if (!response) throw new Error("Could not create hosted chart");
          const charts = response.data;
          if (!charts) throw new Error("Could not create hosted chart");
          const chart = charts[0];
          if (!chart) throw new Error("Could not create hosted chart");
          push(`/u/${chart.id}`);
        }
      } else {
        const oldKey = titleToLocalStorageKey(slugify(initialName));
        const newSlug = slugify(newName);
        const newKey = titleToLocalStorageKey(newSlug);
        if (window.localStorage.getItem(newKey) !== null)
          throw new Error("Chart already exists");
        window.localStorage.setItem(newKey, fullText);
        push(`/${newSlug}`);
        window.localStorage.removeItem(oldKey);
      }
      useDoc.setState((state) => {
        return produce(state, (draft) => {
          (draft.details as any).title = name;
          if (convertToHosted) {
            (draft.details as any).isHosted = true;
          }
        });
      });
    },
    {
      onSuccess: () => {
        useRenameDialogStore.setState({ isOpen: false });
      },
    }
  );
  const isValid =
    newName.length > 2 &&
    (convertToHosted ||
      window.localStorage.getItem(titleToLocalStorageKey(newName)) === null);

  return (
    <>
      <Tooltip
        label={t`Rename`}
        aria-label={t`Rename`}
        className={`slang-type size-${tooltipSize}`}
      >
        <button
          data-rename-button
          onClick={() => useRenameDialogStore.setState({ isOpen: true })}
          aria-label={t`Rename`}
        >
          {children}
        </button>
      </Tooltip>
      <Dialog
        dialogProps={{
          isOpen,
          onDismiss: () => useRenameDialogStore.setState({ isOpen: false }),
          initialFocusRef: inputRef,
          "aria-label": t`Rename`,
        }}
        innerBoxProps={{
          as: "form",
          onSubmit: (e: any) => {
            e.preventDefault();
            rename.mutate();
          },
        }}
      >
        <Section>
          <Type as="h2" size={2} weight="700" style={{ marginBottom: -8 }}>
            <Trans>Rename</Trans>
          </Type>
          {isValidSponsor && !isHosted ? (
            <Box
              flow="column"
              gap={2}
              content="normal start"
              items="center normal"
              as="label"
            >
              <Type>
                <Trans>Convert to hosted chart?</Trans>
              </Type>
              <input
                type="checkbox"
                checked={convertToHosted}
                onChange={(e) => {
                  useRenameDialogStore.setState({
                    convertToHosted: e.target.checked,
                  });
                }}
              />
            </Box>
          ) : null}
          <Input
            value={newName}
            required
            pattern=".{3,}"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
            isLoading={rename.isLoading}
            name="name"
          />
          <Box flow="column" content="normal space-between">
            <Button
              type="button"
              text={`Cancel`}
              onClick={() => useRenameDialogStore.setState({ isOpen: false })}
            />
            <Button type="submit" text={t`Submit`} disabled={!isValid} />
          </Box>
          {isError(rename.error) && <Notice>{rename.error.message}</Notice>}
        </Section>
      </Dialog>
    </>
  );
}
