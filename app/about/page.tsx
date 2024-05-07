import Link from 'next/link'
import React from 'react'

export default function About() {
  return (
    <div className='flex flex-col justify-center p-4'>
      <div className='my-5'></div>
      <h2 className="leading-3 pb-8">About Us</h2>
      <p className="text-wrap text-justify leading-6">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Pariatur ut iusto sed perferendis? Veritatis praesentium cumque voluptatem ullam doloribus eius blanditiis cum, impedit, atque vero et, commodi quod eos quos.</p>
      <p><Link href="/" className="font-thin size-8">Go Home</Link></p>
    </div>
  )
}
