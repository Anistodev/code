import { Component, createContext, useContext, createSignal, JSX, splitProps } from "solid-js";
import { cva } from "cva";
import { ChevronDown } from "lucide-solid";

// Context
type AccordionContextValue = {
  selectedValues: string[];
  toggleItem: (value: string) => void;
  isSelected: (value: string) => boolean;
  type?: "single" | "multiple";
};

const AccordionContext = createContext<AccordionContextValue>();

// Styles
const accordionStyles = cva({
  base: "w-full border border-zinc-800 bg-secondary overflow-hidden",
  variants: {
    variant: {
      default: "",
      outline: "border-0 bg-transparent [&_[data-accordion-trigger]]:border-b [&_[data-accordion-content]]:border-b",
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

const triggerStyles = cva({
  base: "flex w-full items-center justify-between bg-secondary px-4 py-2 text-text transition-colors hover:bg-primary",
  variants: {
    open: {
      true: "bg-primary",
      false: ""
    }
  }
});

// Props interfaces
interface AccordionProps {
  type?: "single" | "multiple";
  collapsible?: boolean;
  defaultValue?: string[];
  class?: string;
  children: JSX.Element;
  onChange?: (values: string[]) => void;
}

interface AccordionItemProps {
  value: string;
  class?: string;
  children: JSX.Element;
}

interface AccordionTriggerProps {
  class?: string;
  children: JSX.Element;
}

interface AccordionContentProps {
  class?: string;
  children: JSX.Element;
}

// Components
export const Accordion: Component<AccordionProps> = (props) => {
  const [local, others] = splitProps(props, ["type", "collapsible", "defaultValue", "onChange", "children"]);
  const [selectedValues, setSelectedValues] = createSignal<string[]>(local.defaultValue || []);

  const toggleItem = (value: string) => {
    const current = selectedValues();
    let newValues: string[];

    if (local.type === "single") {
      newValues = current[0] === value && local.collapsible ? [] : [value];
    } else {
      newValues = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
    }

    setSelectedValues(newValues);
    local.onChange?.(newValues);
  };

  const isSelected = (value: string) => selectedValues().includes(value);

  return (
    <AccordionContext.Provider value={{ selectedValues: selectedValues(), toggleItem, isSelected, type: local.type }}>
      <div class={accordionStyles({ variant: "default" }) + " " + props.class}>
        {props.children}
      </div>
    </AccordionContext.Provider>
  );
};

export const AccordionItem: Component<AccordionItemProps> = (props) => {
  const [local, others] = splitProps(props, ["value", "children"]);
  
  return (
    <div data-accordion-item value={props.value} class={"select-none " + props.class} {...others}>
      {props.children}
    </div>
  );
};

export const AccordionTrigger: Component<AccordionTriggerProps> = (props) => {
  const context = useContext(AccordionContext);
  if (!context) throw new Error("AccordionTrigger must be used within an Accordion");

  const item = () => {
    const parent = (props.children as any)?.parentElement?.closest("[data-accordion-item]");
    return parent?.getAttribute("value") || "";
  };

  return (
    <button
      class={triggerStyles({ open: context.isSelected(item()) }) + " " + props.class}
      onClick={(e) => {
        const parent = (e.currentTarget as HTMLElement).closest("[data-accordion-item]");
        const value = parent?.getAttribute("value") || "";
        context.toggleItem(value);
      }}
    >
      <span>{props.children}</span>
      <ChevronDown 
        class={`w-4 h-4 transition-transform ${
          context.isSelected(item()) ? "rotate-180" : ""
        }`}
      />
    </button>
  );
};

export const AccordionContent: Component<AccordionContentProps> = (props) => {
  const context = useContext(AccordionContext);
  if (!context) throw new Error("AccordionContent must be used within an Accordion");

  const item = () => {
    const parent = (props.children as any)?.parentElement?.closest("[data-accordion-item]");
    return parent?.getAttribute("value") || "";
  };

  return (
    <div
      class={`overflow-hidden transition-all ${
        context.isSelected(item())
          ? "max-h-[1000px] opacity-100" 
          : "max-h-0 opacity-0"
      }`}
    >
      <div class="p-4 text-text bg-secondary">
        {props.children}
      </div>
    </div>
  );
};
