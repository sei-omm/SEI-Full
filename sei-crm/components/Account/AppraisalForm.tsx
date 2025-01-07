import React from "react";
import Input from "../Input";
import { InfoLayout } from "./InfoLayout";
import TextArea from "../TextArea";

export default function AppraisalForm() {
  return (
    <InfoLayout>
      <div className="space-y-5">
        <Input label="Discipline" placeholder="Type here.." />

        <TextArea
          label="Brief description of duties (please mention point-wise)"
          placeholder="Type here.."
          rows={6}
        />

        <TextArea
          label="Specify targets / objectives / goals (in quantitative or other terms) of work you set for yourself or that were set for you, eight to ten items of work in the order of priority and your achievement against each target:"
          placeholder="Type objectives here.."
          rows={6}
        />

        <TextArea label="Achievements" placeholder="Type achievements here.." />
      </div>
    </InfoLayout>
  );
}
