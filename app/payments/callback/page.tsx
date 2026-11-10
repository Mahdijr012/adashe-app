"use client"

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function PaymentCallbackPage() {
  const params = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'failed'>('idle')
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    const reference = params.get('reference') || params.get('trxref')
    if (!reference) {
      setStatus('failed')
      setMessage('Missing payment reference')
      return
    }

    const verify = async () => {
      setStatus('verifying')
      try {
        const res = await fetch(`/api/payments/verify/${reference}`)
        const data = await res.json()
        if (res.ok && data.status === 'success') {
          setStatus('success')
          setMessage('Payment verified successfully!')
        } else {
          setStatus('failed')
          setMessage(data.error || data.message || 'Payment verification failed')
        }
      } catch (e) {
        setStatus('failed')
        setMessage('Could not verify payment')
      }
    }

    verify()
  }, [params])

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto mt-16">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {status === 'verifying' && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
              {status === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
              {status === 'failed' && <XCircle className="h-5 w-5 text-red-600" />}
              Payment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">{status === 'verifying' ? 'Verifying your payment...' : message}</p>
              <div className="flex gap-3">
                <Link href="/dashboard">
                  <Button>Back to Dashboard</Button>
                </Link>
                <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
