import { VoteContractProcessor } from './types/starknet/VoteContract-processor.js'

VoteContractProcessor.bind({}).onVoteEvent(async (event, ctx) => {
  const votes = await ctx.getContract().get_votes()
})
