
import { requireAuth } from '@/app/features/auth/actions';
import { DashboardHeader } from '@/app/features/dashboard/components/dashboard-header';
import { GithubConnectCard } from '@/app/features/github/components/github-connect-card';
import { getInstallationStatus } from '@/app/features/github/server/intallation';
import { Metadata } from 'next';
import React from 'react'


export const instant = false;

export const metadata: Metadata = {
    title: "GitHub App · Dashboard",
  };
  

const DashboardGithubPage = async() => {

    const session = await requireAuth();
    const installation = await getInstallationStatus(session.user.id)

  return (
    <>
    <DashboardHeader
    title="GitHub App"
    description="Install or disconnect the reviewer app on your GitHub account."
  />
  <GithubConnectCard userId={session.user.id} installation={installation} />
  </>
  )
}

export default DashboardGithubPage