import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
import { NextRequest, NextResponse } from 'next/server';

dotenv.config(); // Load environment variables from .env.local

async function applyForJobs() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Go to LinkedIn login page
  await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded' });
  console.log('Navigated to LinkedIn login page');

  // Log in with credentials from environment variables
  if (process.env.LINKEDIN_USERNAME && process.env.LINKEDIN_PASSWORD) {
    await page.type('#username', process.env.LINKEDIN_USERNAME);
    await page.type('#password', process.env.LINKEDIN_PASSWORD);
    await page.click('.btn__primary--large');
    await page.waitForNavigation();
  } else {
    throw new Error('LinkedIn credentials are not set in environment variables');
  }

  // Navigate to the job collection or job search page
  await page.goto('https://www.linkedin.com/jobs/collections/easy-apply/?currentJobId=4082688772&discover=true&discoveryOrigin=JOBS_HOME_GENERIC_CAROUSEL&subscriptionOrigin=JOBS_HOME');
  console.log('Navigated to job collection page');

  // Wait for job cards to load
  await page.waitForSelector('ul.miAddGIjMHHdgORRmJhODYSXmTYqrXKRVBww', { visible: true, timeout: 15000 });

  // Scroll slightly to ensure all jobs are loaded (if needed)
  await page.evaluate(() => window.scrollBy(0, 500));

  // Select and log all job links
  const jobElements = await page.$$eval(
    'ul.miAddGIjMHHdgORRmJhODYSXmTYqrXKRVBww a.job-card-list__title--link',
    links => links.map(link => link.href)
  );

  if (jobElements.length > 0) {
    console.log('Job links found:', jobElements);

    for (const jobLink of jobElements) {
      try {
        // Navigate to each job link
        await page.goto(jobLink);
        console.log(`Navigated to job: ${jobLink}`);

        // Check if "Easy Apply" button exists
        const easyApplyButton = await page.$('.jobs-apply-button');
        if (easyApplyButton) {
          await easyApplyButton.click();
          console.log('Clicked Easy Apply button');

          // Wait for the application form to load and fill it (simplified)
          await new Promise(resolve => setTimeout(resolve, 2000)); // Adjust timing based on loading speed
          const submitButton = await page.$('button[aria-label="Submit application"]');
          if (submitButton) {
            await submitButton.click();
            console.log(`Application submitted for: ${jobLink}`);
          } else {
            console.log(`Application form not completed for: ${jobLink}`);
          }
        } else {
          console.log(`No Easy Apply button for: ${jobLink}`);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error applying to job ${jobLink}:`, error.message);
        } else {
          console.error(`Error applying to job ${jobLink}:`, error);
        }
      }
    }
  } else {
    console.error('No job links found. Try adjusting the selector or wait time.');
  }

  await browser.close();
}

export async function POST(req: NextRequest) {
  try {
    console.log('Received POST request');
    await applyForJobs();
    return NextResponse.json({ message: 'Successfully applied to jobs!' }, { status: 200 });
  } catch (error) {
    console.error('Error applying for jobs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
