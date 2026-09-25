import { Step, Stepper } from "@via-ds/components/stepper";

export default function OrderStatusBar({ stages, current }) {
  const currentStep = stages.indexOf(current) + 1;
  console.log(currentStep);

  if (currentStep === 0) return null;

  return (
    <Stepper currentStep={currentStep} aria-label="Order status">
      {stages.map((stage, index) => (
        <Step key={index} textValue={stage}>
          {stage}
        </Step>
      ))}
    </Stepper>
  );
}
