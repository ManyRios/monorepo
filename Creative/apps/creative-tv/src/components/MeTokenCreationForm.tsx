import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAddress } from '@thirdweb-dev/react'
import { createMeToken, approveTokens } from 'utils/fetchers/createMeToken'
import { getMeTokenContract } from 'utils/fetchers/createMeToken'
import { Box, Button, Divider, FormControl, FormErrorMessage, FormLabel, Heading, Input, Stack } from '@chakra-ui/react'

export default function MeTokenCreationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()
  const address = useAddress()
  const [meTokenContract, setMeTokenContract] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isApproved, setApproved] = useState(false)

  useEffect(() => {
    const getContract = async () => {
      const contract = await getMeTokenContract(address || '')
      setMeTokenContract(contract)
    }
    getContract()
  }, [address])

  console.log({ meTokenContract })

  const approve = async () => {
    const meTokenAddress = meTokenContract.contractWrapper.readContract.address
    console.log({ meTokenAddress, address })

    if (!isApproved && address && meTokenAddress) {
      await approveTokens('10000000000000000000000', address, meTokenAddress)
      setApproved(true)
    }
  }

  const onSubmit = async (data: any) => {
    setIsLoading(true)

    try {
      const { name, symbol, hubId, assetsDeposited } = data
      const tx = await createMeToken({ name, symbol, hubId, assetsDeposited }, meTokenContract)
      console.log(tx)
      setIsSubmitted(true)
      reset()
    } catch (error) {
      console.log('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let timer: any

    if (isSubmitted) {
      timer = setTimeout(() => {
        setIsSubmitted(false)
        setIsLoading(false)
      }, 3000)
    }

    return () => {
      clearTimeout(timer)
    }
  }, [isSubmitted])

  const inputBoxStyle = {
    borderRadius: '4px',
    display: 'flex',
    width: '45vw',
    marginBottom: '15px',
    padding: '15px',
  }

  return (
    <Box
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      position={'relative'}
      bg="#171923"
      borderRadius="3xl"
      boxShadow="2xl"
      overflow="hidden"
      width="100%"
      display="flex"
      flexDirection="column"
      padding="1px"
      alignItems="center"
      mb="30px">
      <Box bg="#171923" zIndex={2} p={8} overflow="hidden" width="100%" height="100%" borderRadius="3xl">
        <Heading mb={3} fontSize="2em" fontWeight="bold" color="#EDEDEE" textAlign="center">
          meToken Creation Form
        </Heading>
        <Divider width="75%" margin="0 auto" marginBottom="3em" border="none" borderBottom="1px solid #EDEDEE" />
        <Stack spacing={4} width="100%">
          <FormControl isInvalid={!!errors.name}>
            <FormLabel color="white">Name:</FormLabel>
            <Input type="text" placeholder="Your meToken Name" {...register('name', { required: true })} />
            <FormErrorMessage>This field is required</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.symbol}>
            <FormLabel color="#EDEDEE">Symbol:</FormLabel>
            <Input type="text" placeholder="Your meToken symbol" {...register('symbol', { required: true })} />
            <FormErrorMessage>This field is required</FormErrorMessage>
          </FormControl>

            <Input type="hidden" value="1" {...register('hubId')} />
          <FormControl isInvalid={!!errors.assetsDeposited}>
            <FormLabel color="#EDEDEE">Assets Deposited:</FormLabel>
            <Input type="text" placeholder="Number of assets deposited" {...register('assetsDeposited', { required: true })} />
            <FormErrorMessage>This field is required</FormErrorMessage>
          </FormControl>
        </Stack>
        <Box display="flex" flexDirection="row" alignItems="center" justifyContent="start" mt={5} gap={5} sx={{
          button: {
            width: '150px',
            borderRadius: "10px",
            fontSize: "18px",
            fontWeight:"bold",
            height:"50px",
            padding:"10px"
          }
        }}>
          {!isApproved && <Button
            background="linear-gradient(to right, #E03C88, #E34335, #F6B138)"
            onClick={approve} variant="solid">Approve</Button>}
        {isLoading && isApproved ? (
          <Button
            type="submit"
            disabled
            background="linear-gradient(to right, #E03C88, #E34335, #F6B138)">
            Creating meToken...
          </Button>
        ) : (
          <Button
            type="submit"
            background="linear-gradient(to right, #E03C88, #E34335, #F6B138)"
>
            {isSubmitted ? 'meToken Created!' : 'Submit'}
          </Button>
          )}
          </Box>
      </Box>
      <Box pos="absolute" inset="-1px" borderRadius="3xl" background="linear-gradient(to top, #E03C88, #E34335, #F6B138, transparent, transparent)" zIndex={0} />
    </Box>
  )
}
