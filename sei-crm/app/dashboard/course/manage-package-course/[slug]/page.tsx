"use client";

import { BASE_API } from "@/app/constant";
import { useDoMutation } from "@/app/utils/useDoMutation";
import BackBtn from "@/components/BackBtn";
import Button from "@/components/Button";
import CampusNew from "@/components/CampusNew";
import ChooseCourse from "@/components/Course/ChooseCourse";
import DropDownNew from "@/components/FormInputs/DropDownNew";
import InputNew from "@/components/FormInputs/InputNew";
import HandleSuspence from "@/components/HandleSuspence";
import { usePurifySearchParams } from "@/hooks/usePurifySearchParams";
import { ISinglePackage, ISuccess } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { IoAddSharp } from "react-icons/io5";
import { useQuery } from "react-query";
import z from "zod";

interface IProps {
  params: {
    slug: "add" | string;
  };
}

const packageFormSchema = z.object({
  course_info: z.array(
    z.object({
      course_id: z.number().min(1),
      course_fee: z.number(),
    })
  ),
  package_name: z.string().min(1, { message: "Package Name Is Required" }),
  price: z.number(),
  institute: z.string().min(1, "Institute is required"),
  visibility: z.string().min(1, { message: "Visibility Is Required" }),
});

export type PackageForm = z.infer<typeof packageFormSchema>;

async function getSinglePackageInfo(packageId: number) {
  return (await axios.get(`${BASE_API}/course/package/${packageId}`)).data;
}

export default function ManageEachPackage({ params }: IProps) {
  const isNew = params.slug === "add";
  const packageId = params.slug !== "add" ? parseInt(params.slug) : -1;

  const searchParams = usePurifySearchParams();

  const route = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    clearErrors,
    setValue,
    watch,
    reset,
  } = useForm<PackageForm>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      price: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "course_info",
    control: control,
  });

  const watchCourseInfo = watch("course_info", []);

  const totalFee = watchCourseInfo.reduce(
    (sum, course) => sum + (parseInt(course.course_fee.toString()) || 0),
    0
  );

  const { isLoading, mutate } = useDoMutation();

  const handleFormSubmit = (formData: PackageForm) => {
    if (isNew) {
      return mutate({
        formData,
        method: "post",
        apiPath: "/course/package",
        onSuccess() {
          route.push(
            `/dashboard/course/manage-package-course?institute=${
              formData.institute
            }&code=${Math.floor(Math.random() * 1000)}`
          );
        },
      });
    }

    mutate({
      apiPath: "/course/package",
      formData,
      method: "put",
      id: packageId,
      onSuccess() {
        route.push(
          `/dashboard/course/manage-package-course?institute=${
            formData.institute
          }&code=${Math.floor(Math.random() * 1000)}`
        );
      },
    });
  };

  const { isFetching, error } = useQuery<ISuccess<ISinglePackage>>({
    queryKey: ["get-single-package", packageId],
    queryFn: () => getSinglePackageInfo(packageId),
    enabled: !isNew,
    refetchOnMount: true,
    onSuccess(data) {
      reset(data.data);
    },
  });

  return (
    <HandleSuspence isLoading={isFetching} error={error} dataLength={1}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="grid grid-cols-2 gap-5">
          <InputNew
            {...register("package_name")}
            label="Package Name *"
            placeholder="Enter Package Name"
            error={errors.package_name?.message}
          />
          <Controller
            name="institute"
            control={control}
            render={({ field }) => (
              <CampusNew
                {...register("institute")}
                onChange={(item) => {
                  setValue("institute", item.value);
                  clearErrors("institute");
                }}
                defaultValue={searchParams.get("institute") || field.value}
                error={errors.institute?.message}
              />
            )}
          />
        </div>

        <div className="space-y-4 mt-5">
          <Button
            disabled={isLoading}
            type="button"
            onClick={() =>
              append({
                course_id: 0,
                course_fee: 0,
              })
            }
            className="flex items-center gap-2"
          >
            <IoAddSharp size={20} />
            Assign Course
          </Button>
          <ul className="space-y-5 shadow-md p-10 border rounded-xl">
            {fields.map((fild, index) => (
              <ChooseCourse
                key={fild.id}
                institute={watch("institute")}
                index={index}
                clearErrors={clearErrors}
                control={control}
                errors={errors}
                register={register}
                onRemove={remove}
                setValue={setValue}
                course_fee={fild.course_fee || 0}
              />
            ))}
          </ul>

          <h3 className="text-end">
            <span className="font-semibold">Total :</span>{" "}
            <span>₹{totalFee}</span>
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <Controller
            name="visibility"
            control={control}
            render={({ field }) => (
              <DropDownNew
                {...register("visibility")}
                label="Package Visibility"
                options={[
                  { text: "Public", value: "Public" },
                  { text: "Private", value: "Private" },
                ]}
                onChange={(option) => {
                  setValue("visibility", option.value);
                }}
                defaultValue={field.value}
                error={errors.visibility?.message}
              />
            )}
          />
          <InputNew
            {...register("price", { valueAsNumber: true })}
            label="Package Price *"
            placeholder="Enter Package Price"
            error={errors.price?.message}
          />
        </div>

        <h3 className="text-end mt-5">
          <span className="font-semibold">Discount :</span>{" "}
          <span>₹{totalFee - watch("price")}</span>
        </h3>

        <div className="flex items-center gap-5">
          <BackBtn />
          <Button loading={isLoading} disabled={isLoading} type="submit">
            {isNew ? "Submit Package" : "Update Package Info"}
          </Button>
        </div>
      </form>
    </HandleSuspence>
  );
}
