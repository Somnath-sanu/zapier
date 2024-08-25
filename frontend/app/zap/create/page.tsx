/* eslint-disable @next/next/no-img-element */
"use client";

import { BACKEND_URL } from "@/app/config";
import { LinkButtton } from "@/components/buttons/LinkButtton";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { Input } from "@/components/Input";
import { ZapCell } from "@/components/ZapCell";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { z } from "zod";

function useAvailableActionsAndTriggers() {
  const [availableActions, setAvailableActions] = useState([]);
  const [availableTriggers, setAvailableTriggers] = useState([]);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/v1/trigger/available`)
      .then((x) => setAvailableTriggers(x.data.availableTriggers));

    axios
      .get(`${BACKEND_URL}/api/v1/action/available`)
      .then((x) => setAvailableActions(x.data.availableActions));
  }, []);

  return {
    availableActions,
    availableTriggers,
  };
}

/**
 * The return statement runs before useEffect.
  useEffect runs after the component renders and is used to handle side effects like data fetching.

  , the return statement in the useAvailableActionsAndTriggers hook runs first, returning the initial empty arrays for availableActions and availableTriggers. Then, useEffect runs, fetches the data, and updates the state, which will trigger a re-render of any component using this hook with the new data.
 * 
 */

export default function Page() {
  const { availableActions, availableTriggers } =
    useAvailableActionsAndTriggers();
  const [selectedTrigger, setSelectedTrigger] = useState<{
    name: string;
    id: string;
  }>();
  const [selectedActions, setSelectedActions] = useState<
    {
      index: number;
      availableActionId: string;
      availableActionName: string;
      metadata: any;
    }[]
  >([]);

  const [selectedModalIndex, setSelectedModalIndex] = useState<null | number>(
    null
  );

  const router = useRouter();

  return (
    <div className="bg-slate-200">
      <div className="flex justify-end bg-slate-200 pt-4 px-2">
        <PrimaryButton
          onClick={async () => {
            if (!selectedTrigger?.id) {
              alert("Invalid Trigger");
              return;
            }

            const invalidAction = selectedActions.some(
              (a) => a.availableActionId === ""
            );

            if (invalidAction) {
              alert("Invalid Action");
              return;
            }

            const response = await axios.post(
              `${BACKEND_URL}/api/v1/zap`,
              {
                availableTriggerId: selectedTrigger?.id,
                triggerMetadata: {},
                actions: selectedActions.map((a) => ({
                  availableActionId: a.availableActionId,
                  actionMetadata: a.metadata,
                })),
              },
              {
                headers: {
                  Authorization: localStorage.getItem("token"),
                },
              }
            );

            router.push("/dashboard");
          }}
        >
          Publish
        </PrimaryButton>
      </div>
      <div className="w-full min-h-screen bg-slate-200 flex flex-col justify-center pt-4">
        <div className="flex justify-center w-full">
          <ZapCell
            onClick={() => setSelectedModalIndex(1)}
            name={selectedTrigger?.name ? selectedTrigger?.name : "Trigger"}
            index={1}
          />
        </div>
        <div className="w-full pt-2 pb-2">
          {selectedActions.map((action, idx) => (
            <div
              key={idx}
              className="flex justify-center pt-2 gap-2 items-center w-full flex-col"
            >
              <ZapCell
                name={
                  action.availableActionName
                    ? action.availableActionName
                    : "Action"
                }
                index={action.index}
                onClick={() => setSelectedModalIndex(action.index)}
              />
              {idx === selectedActions.length - 1 && (
                <div>
                  <button
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-3xl"
                    title="Delete action"
                    onClick={() => {
                      setSelectedActions((a) =>
                        a.filter((ac) => ac.index !== action.index)
                      );
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <LinkButtton
            onClick={() => {
              setSelectedActions((a) => [
                ...a,
                {
                  index: a.length + 2,
                  availableActionId: "",
                  availableActionName: "",
                  metadata: {},
                },
              ]);
            }}
          >
            <p className="text-3xl" title="Add action">
              +
            </p>
          </LinkButtton>
        </div>
      </div>
      {selectedModalIndex && (
        <Modal
          availableItems={
            selectedModalIndex === 1 ? availableTriggers : availableActions
          }
          index={selectedModalIndex}
          onSelect={(
            props: null | { name: string; id: string; metadata: any }
          ) => {
            if (props === null) {
              setSelectedModalIndex(null);
              return;
            }
            if (selectedModalIndex === 1) {
              setSelectedTrigger({
                id: props.id,
                name: props.name,
              });
              setSelectedModalIndex(null);
              return;
            } else {
              setSelectedActions((a) => {
                let newActions = [...a];
                // console.log(newActions);
                // console.log(selectedModalIndex);

                newActions[selectedModalIndex - 2] = {
                  index: selectedModalIndex,
                  availableActionId: props.id,
                  availableActionName: props.name,
                  metadata: props.metadata,
                };
                return newActions;
              });
              setSelectedModalIndex(null);
              return;
            }
          }}
        />
      )}
    </div>
  );
}

function Modal({
  index,
  onSelect,
  availableItems,
}: {
  index: number;
  onSelect: (props: null | { name: string; id: string; metadata: any }) => void;
  availableItems: { id: string; name: string; image?: string }[];
}) {
  const [step, setStep] = useState(0);
  const [selectedAction, setSelectedAction] = useState<{
    name: string;
    id: string;
  }>();
  const isTrigger = index === 1;

  return (
    <div className="fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full flex bg-slate-500 bg-opacity-45">
      <div className="relative p-4 w-full max-w-2xl max-h-full">
        <div className="relative bg-white rounded-lg shadow">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t">
            <div className="text-xl">
              Select {index === 1 ? "Trigger" : "Action"}
            </div>
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              data-modal-hide="default-modal"
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>

          {step === 1 && selectedAction?.id === "email" && (
            <EmailSelector
              setMetadata={(metadata) => {
                onSelect({
                  ...selectedAction,
                  metadata,
                });
              }}
            />
          )}
          {step === 1 && selectedAction?.id === "sol" && (
            <SolanaSelector
              setMetadata={(metadata) => {
                onSelect({
                  ...selectedAction,
                  metadata,
                });
              }}
            />
          )}

          {step === 0 && (
            <div className="p-4 md:p-5 space-y-4">
              {availableItems.map(({ id, name, image }) => {
                return (
                  <div
                    className="flex border p-4 cursor-pointer hover:bg-slate-200"
                    key={id}
                    onClick={() => {
                      if (isTrigger) {
                        onSelect({
                          id,
                          name,
                          metadata: {},
                        });
                      } else {
                        setStep((s) => s + 1);
                        setSelectedAction({
                          id,
                          name,
                        });
                      }
                    }}
                  >
                    <img
                      src={image}
                      alt=""
                      width={30}
                      className="rounded-full mr-4"
                    />
                    <div className="flex flex-col justify-center">{name}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmailSelector({
  setMetadata,
}: {
  setMetadata: (params: any) => void;
}) {
  const [email, setEmail] = useState();
  const [body, setBody] = useState();
  const [errors, setErrors] = useState<{ email?: string; body?: string }>({});

  const metadataSchemaEmail = z.object({
    email: z.string(),
    body: z.string().min(1, "Body cannot be empty"),
  });

  const handleSubmit = () => {
    const result = metadataSchemaEmail.safeParse({ email, body });

    if (result.success) {
      setMetadata(result.data);
    } else {
      const errorMessages = result.error.format();

      setErrors({
        email: errorMessages.email?._errors[0],
        body: errorMessages.body?._errors[0],
      });
    }
  };

  return (
    <div className="p-3 space-y-3">
      <Input
        label="To"
        type="text"
        placeholder="To"
        onChange={(e) => setEmail(e.target.value)}
      />
      {errors.email && <p className="text-red-500">{errors.email}</p>}
      <Input
        label="Body"
        type="text"
        placeholder="Body"
        onChange={(e) => setBody(e.target.value)}
      />
      {errors.body && <p className="text-red-500">{errors.body}</p>}
      <PrimaryButton
        onClick={() => {
          handleSubmit();
        }}
      >
        Submit
      </PrimaryButton>
    </div>
  );
}

function SolanaSelector({
  setMetadata,
}: {
  setMetadata: (params: any) => void;
}) {
  const [address, setAddress] = useState();
  const [amount, setAmount] = useState();
  const [errors, setErrors] = useState<{ address?: string; amount?: string }>(
    {}
  );

  const metadataSchemaSolana = z.object({
    address: z.string(),
    amount: z
      .string()
      .min(1, "Enter Amount")
      .regex(/^\d+(\.\d{1,2})?$/, "Amount must be a valid number"),
  });

  const handleSubmit = () => {
    const result = metadataSchemaSolana.safeParse({ address, amount });

    if (result.success) {
      setMetadata(result.data); // {address: "" , amount: ""}
    } else {
      const errorMessages = result.error.format();

      setErrors({
        address: errorMessages.address?._errors[0],
        amount: errorMessages.amount?._errors[0],
      });
    }
  };

  return (
    <div className="p-3 space-y-3">
      <Input
        label="To"
        type="text"
        placeholder="address"
        onChange={(e) => setAddress(e.target.value)}
      />
      {errors.address && <p className="text-red-500">{errors.address}</p>}
      <Input
        label="Amount"
        type="text"
        placeholder="amount"
        onChange={(e) => setAmount(e.target.value)}
      />
      {errors.amount && <p className="text-red-500">{errors.amount}</p>}
      <PrimaryButton
        onClick={() => {
          handleSubmit();
        }}
      >
        Submit
      </PrimaryButton>
    </div>
  );
}
