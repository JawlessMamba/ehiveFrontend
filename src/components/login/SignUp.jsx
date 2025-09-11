// components/SignUp.tsx
import { useForm } from "react-hook-form";
import { useSignUp } from '../../../api/client/user';

export default function SignUp() {
  const { register, handleSubmit, reset } = useForm();
  const mutation = useSignUp();

  const onSubmit = (data) => {
    mutation.mutate(data, {
      onSuccess: () => reset(),
    });
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-xl shadow-md w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Sign Up</h2>

        <input
          type="text"
          placeholder="Name"
          {...register("name", { required: true })}
          className="w-full p-2 border rounded"
        />

        <input
          type="email"
          placeholder="Email"
          {...register("email", { required: true })}
          className="w-full p-2 border rounded"
        />

        <input
          type="password"
          placeholder="Password"
          {...register("password", { required: true })}
          className="w-full p-2 border rounded"
        />

        <select {...register("role", { required: true })} className="w-full p-2 border rounded">
          <option value="">Select Role</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {mutation.isPending ? "Creating..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
