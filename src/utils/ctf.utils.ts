import { ethers } from 'ethers'

export function createQuestionId(title: string): string {
  const titleBytes = ethers.utils.toUtf8Bytes(title)
  const questionId = ethers.utils.keccak256(titleBytes)
  return questionId
}
