import { Show, createSignal, type Component, createEffect } from "solid-js";
import { Portal } from "solid-js/web";

interface PopoverProps {
  trigger: Component | any;
  children: any;
  position?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  width?: string;
  class?: string;
}

const Popover: Component<PopoverProps> = (props) => {
  // State
  const [isOpen, setIsOpen] = createSignal(false);
  const [triggerRect, setTriggerRect] = createSignal<DOMRect | null>(null);
  
  // Refs
  let triggerRef: HTMLDivElement | undefined;
  let popoverRef: HTMLDivElement | undefined;

  // Event handlers
  const updatePosition = () => {
    if (triggerRef) {
      const rect = triggerRef.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const popoverHeight = popoverRef?.offsetHeight || 0;
      const popoverWidth = popoverRef?.offsetWidth || 0;

      setTriggerRect(rect);

      if (popoverRef) {
        // Calculate position based on props.position
        switch (props.position || "bottom") {
          case "top":
            popoverRef.style.top = `${rect.top - popoverHeight}px`;
            break;
          case "bottom":
            popoverRef.style.top = `${rect.bottom}px`;
            break;
          case "left":
            popoverRef.style.left = `${rect.left - popoverWidth}px`;
            popoverRef.style.top = `${rect.top}px`;
            return;
          case "right":
            popoverRef.style.left = `${rect.right}px`;
            popoverRef.style.top = `${rect.top}px`;
            return;
        }

        // Calculate horizontal alignment
        switch (props.align || "center") {
          case "start":
            popoverRef.style.left = `${rect.left}px`;
            break;
          case "center":
            popoverRef.style.left = `${rect.left + (rect.width - popoverWidth) / 2}px`;
            break;
          case "end":
            popoverRef.style.left = `${rect.right - popoverWidth}px`;
            break;
        }

        // Adjust if popover would overflow viewport
        const popoverRect = popoverRef.getBoundingClientRect();
        if (popoverRect.left < 0) {
          popoverRef.style.left = "0px";
        } else if (popoverRect.right > viewportWidth) {
          popoverRef.style.left = `${viewportWidth - popoverWidth}px`;
        }
      }
    }
  };

  const handleTriggerClick = () => {
    const newIsOpen = !isOpen();
    setIsOpen(newIsOpen);
    
    if (newIsOpen) {
      updatePosition();
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as Node;
    if (!triggerRef?.contains(target) && !popoverRef?.contains(target)) {
      setIsOpen(false);
    }
  };

  // Effects
  createEffect(() => {
    if (isOpen()) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);
      
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
      };
    }
  });

  return (
    <>
      <div 
        ref={triggerRef}
        onClick={handleTriggerClick}
        class="inline-block"
      >
        {typeof props.trigger === "function" ? props.trigger({}) : props.trigger}
      </div>

      <Show when={isOpen() && triggerRect()}>
        <Portal>
          <div
            ref={popoverRef}
            class={`
              fixed z-50 bg-secondary border border-zinc-800 shadow-lg
              ${props.class || ""}
            `}
            style={{
              width: props.width,
              "min-width": "max-content"
            }}
          >
            {props.children}
          </div>
        </Portal>
      </Show>
    </>
  );
};

export default Popover;