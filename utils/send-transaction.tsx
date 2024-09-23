"use client";
import * as React from "react";
import {
  useWriteContract,
  useReadContract,
  useAccount,
  useWaitForTransactionReceipt,
  UseReadContractReturnType,
} from "wagmi";
import contract from "../constants.json";

export function SendTransaction() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { address: myAddress } = useAccount();

  const balanceUser: UseReadContractReturnType = useReadContract({
    abi: contract.usdtFujiAbi,
    address: contract.usdtFujiAddress as `0x${string}`,
    functionName: "balanceOf",
    args: [myAddress],
  });

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const to = formData.get("address") as `0x${string}`;
    const value = formData.get("value") as string;
    writeContract({
      abi: contract.usdtFujiAbi,
      address: contract.usdtFujiAddress as `0x${string}`,
      functionName: "transfer",
      args: [to, value],
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  return (
    <form onSubmit={submit}>
      <input name="address" placeholder="0xA0Cf…251e" required />
      <input name="value" placeholder="0.05" required />
      <div>
        {balanceUser.data
          ? `Tu balance es de: ${Number(balanceUser.data) / 10 ** 18}`
          : ""}
      </div>
      <button disabled={isPending} type="submit">
        {isPending ? "Confirming..." : "Send"}
      </button>
      {isConfirming && <div>Waiting for confirmation...</div>}
      {isConfirmed && <div>Transaction confirmed.</div>}
      {hash && <div>Transaction Hash: {hash}</div>}
    </form>
  );
}
