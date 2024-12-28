import { For, Show, createSignal, type Component } from "solid-js";
import Button from "./Button";

export interface Step {
  id: string;
  label: string;
  content: any;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  defaultStep?: string;
  class?: string;
  onStepChange?: (stepId: string) => void;
  onFinish?: () => void;
}

const Stepper: Component<StepperProps> = (props) => {
  const [activeStep, setActiveStep] = createSignal(props.defaultStep || props.steps[0]?.id);

  const currentStepIndex = () => props.steps.findIndex(step => step.id === activeStep());

  const handleNext = () => {
    const nextIndex = currentStepIndex() + 1;
    if (nextIndex < props.steps.length) {
      const nextStepId = props.steps[nextIndex].id;
      setActiveStep(nextStepId);
      props.onStepChange?.(nextStepId);
    } else if (nextIndex === props.steps.length) {
      props.onFinish?.();
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentStepIndex() - 1;
    if (prevIndex >= 0) {
      const prevStepId = props.steps[prevIndex].id;
      setActiveStep(prevStepId);
      props.onStepChange?.(prevStepId);
    }
  };

  return (
    <div class={"flex flex-col " + props.class}>
      <div class="flex items-center mb-4">
        <For each={props.steps}>
          {(step, index) => (
            <>
              <div class="flex items-center">
                <div
                  class={`w-8 h-8 rounded-full flex items-center justify-center border 
                    ${activeStep() === step.id 
                      ? "bg-white text-background border-white" 
                      : "border-zinc-800 text-zinc-400"
                    }`}
                >
                  {index() + 1}
                </div>
                <Show when={step.label}>
                  <div class="ml-2">
                    <div class={`text-sm font-medium ${
                      activeStep() === step.id ? "text-text" : "text-zinc-400"
                    }`}>
                      {step.label}
                    </div>
                    <Show when={step.description}>
                      <div class="text-xs text-zinc-500">{step.description}</div>
                    </Show>
                  </div>
                </Show>
              </div>
              <Show when={index() < props.steps.length - 1}>
                <div class="flex-1 mx-4 h-[1px] bg-zinc-800" />
              </Show>
            </>
          )}
        </For>
      </div>

      <div class="flex-1">
        <For each={props.steps}>
          {(step) => (
            <Show when={activeStep() === step.id}>
              <div class="min-h-[200px]">{step.content}</div>
            </Show>
          )}
        </For>
      </div>

      <div class="flex justify-between mt-4">
        <Button
          variant="secondary"
          onClick={handlePrevious}
          disabled={currentStepIndex() === 0}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          onClick={handleNext}
          disabled={currentStepIndex() === props.steps.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Stepper;
