"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MdError } from "react-icons/md";
import { useFormContext } from "react-hook-form";

export default function UnitOfMeasure() {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <div className=" flex flex-col gap-2 pt-[6px]">
      <Label htmlFor="unitOfMeasure" className="text-white/80">
        {`Unit of Measure`}
      </Label>
      <Input
        {...register("unitOfMeasure")}
        type="text"
        id="unitOfMeasure"
        className="h-11 bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-zinc-400/30 dark:border-white/20 text-white placeholder:text-white/40 focus-visible:border-zinc-400 focus-visible:ring-zinc-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
        placeholder="e.g., kg, liters, boxes, units"
      />
      {errors.unitOfMeasure && (
        <div className="text-zinc-500 flex gap-1 items-center text-[13px]">
          <MdError />
          <p>
            <>{errors.unitOfMeasure.message}</>
          </p>
        </div>
      )}
    </div>
  );
}
