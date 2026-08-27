// lib/cookies.js
'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function selectUser(userId) {
  const cookieStore = await cookies()
  cookieStore.set('selected_user', userId, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
  redirect('/')
}

export async function logoutUser() {
  const cookieStore = await cookies()
  cookieStore.delete('selected_user')
  redirect('/login')
}
