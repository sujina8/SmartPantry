import { test, expect } from '@playwright/test'

test.afterEach(async ({ page }, testInfo) => {
  const screenshot = await page.screenshot({ fullPage: true });

  await testInfo.attach('Final Screenshot', {
    body: screenshot,
    contentType: 'image/png',
  });
});

const API_BASE = 'http://localhost:8000/api'

const setAuthState = async (page) => {
  await page.addInitScript(() => {
    localStorage.setItem('access_token', 'access-token')
    localStorage.setItem('refresh_token', 'refresh-token')
    localStorage.setItem(
      'user',
      JSON.stringify({ full_name: 'Test User', email: 'test.user@example.com' })
    )
  })
}

test('ST1: user registration with 2FA enabled', async ({ page }) => {
  await page.route(`${API_BASE}/auth/register/`, async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'registered' }),
    })
  })

  await page.goto('/register')

  await page.locator('#fullName').fill('Test User')
  await page.locator('#email').fill('test.user@example.com')
  await page.locator('#password').fill('Password123!')
  await page.locator('#confirmPassword').fill('Password123!')
  await page.locator('#householdSize').fill('3')
  await page.getByRole('button', { name: 'Enable two-factor authentication' }).click()
  await page.getByRole('button', { name: 'Register' }).click()

  await page.waitForURL('**/login')
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
})

test('ST2A: login without 2FA skips OTP flow', async ({ page }) => {
  await page.route(`${API_BASE}/auth/login/`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access: 'access-token',
        refresh: 'refresh-token',
        user: {
          full_name: 'Test User',
          email: 'test.user@example.com',
        },
      }),
    })
  })

  await page.route(`${API_BASE}/inventory/`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  })

  await page.route(`${API_BASE}/donations/`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  })

  await page.goto('/login')
  await page.locator('#email').fill('test.user@example.com')
  await page.locator('#password').fill('Password123!')
  await page.getByRole('button', { name: 'Login' }).click()

  await page.waitForURL('**/dashboard')
  await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible()
  await expect(page.getByLabel('6-digit code')).toHaveCount(0)
})

test('ST2: login with valid credentials and OTP verification', async ({ page }) => {
  await page.route(`${API_BASE}/auth/login/`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        requires_2fa: true,
        email: 'test.user@example.com',
      }),
    })
  })

  await page.route(`${API_BASE}/auth/verify-otp/`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access: 'access-token',
        refresh: 'refresh-token',
        user: {
          full_name: 'Test User',
          email: 'test.user@example.com',
        },
      }),
    })
  })

  await page.route(`${API_BASE}/inventory/`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  })

  await page.route(`${API_BASE}/donations/`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  })

  await page.goto('/login')

  await page.locator('#email').fill('test.user@example.com')
  await page.locator('#password').fill('Password123!')
  await page.getByRole('button', { name: 'Login' }).click()

  await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible()
  await expect(page.getByText('test.user@example.com')).toBeVisible()

  await page.getByLabel('6-digit code').fill('123456')
  await page.getByRole('button', { name: 'Verify & Login' }).click()

  await page.waitForURL('**/dashboard')
  await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible()
})

test('ST3: login with wrong password shows an error', async ({ page }) => {
  await page.route(`${API_BASE}/auth/login/`, async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Invalid email or password.' }),
    })
  })

  await page.goto('/login')

  await page.locator('#email').fill('test.user@example.com')
  await page.locator('#password').fill('WrongPassword')
  await page.getByRole('button', { name: 'Login' }).click()

  await expect(page.getByText('Invalid email or password. Please try again.')).toBeVisible()
  await expect(page).toHaveURL(/\/login$/)
})

test('ST4: add a food item through the inventory UI', async ({ page }) => {
  await setAuthState(page)

  const inventoryItems = []

  await page.route(`${API_BASE}/inventory/`, async (route) => {
    const method = route.request().method()

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(inventoryItems),
      })
      return
    }

    if (method === 'POST') {
      inventoryItems.push({
        id: inventoryItems.length + 1,
        name: 'Milk',
        quantity: '2',
        unit: 'L',
        category: 'dairy',
        storage_location: 'fridge',
        expiry_date: '2026-07-25',
        is_expiring_soon: false,
        image: null,
      })

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(inventoryItems[inventoryItems.length - 1]),
      })
    }
  })

  await page.route(`${API_BASE}/donations/`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  })

  await page.goto('/inventory')

  await page.getByRole('button', { name: '+ Add Item' }).click()
  await page.locator('input[name="name"]').fill('Milk')
  await page.locator('input[name="quantity"]').fill('2')
  await page.locator('input[name="unit"]').fill('L')
  await page.locator('input[name="expiry_date"]').fill('2026-07-25')
  await page.locator('select[name="category"]').selectOption('dairy')
  await page.locator('select[name="storage_location"]').selectOption('fridge')
  await page.locator('textarea[name="notes"]').fill('Bought for breakfast')
  await page.locator('.sp-modal form').getByRole('button', { name: 'Add Item', exact: true }).click()

  await expect(page.getByText('Food item added successfully!')).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Milk' })).toBeVisible()
})

test('ST5: show expiring soon badge for an item expiring in 2 days', async ({ page }) => {
  await setAuthState(page)

  const inTwoDays = new Date()
  inTwoDays.setDate(inTwoDays.getDate() + 2)
  const expiryDate = inTwoDays.toISOString().split('T')[0]

  await page.route(`${API_BASE}/inventory/`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 1,
          name: 'Yogurt',
          quantity: '1',
          unit: 'cup',
          category: 'dairy',
          storage_location: 'fridge',
          expiry_date: expiryDate,
          is_expiring_soon: true,
          image: null,
        },
      ]),
    })
  })

  await page.route(`${API_BASE}/donations/`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  })

  await page.goto('/inventory')

  await expect(page.getByRole('cell', { name: 'Yogurt' })).toBeVisible()
  await expect(page.locator('tbody tr').filter({ hasText: 'Yogurt' }).getByText('Expiring Soon', { exact: true })).toBeVisible()
})

test('ST6: browse a donation and claim it', async ({ page }) => {
  await setAuthState(page)

  const donations = [
    {
      id: 1,
      status: 'available',
      pickup_info: 'Available after 5pm',
      food_item_detail: {
        name: 'Rice',
        quantity: '5',
        unit: 'kg',
        category: 'Fresh',
        expiry_date: '2026-07-28',
        image: null,
      },
    },
  ]

  await page.route(`${API_BASE}/donations/`, async (route) => {
    const method = route.request().method()

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(donations),
      })
      return
    }
  })

  await page.route(`${API_BASE}/donations/*/claim/`, async (route) => {
    const claimMatch = route.request().url().match(/\/donations\/(\d+)\/claim\//)
    if (claimMatch) {
      const donationId = Number(claimMatch[1])
      const donation = donations.find((item) => item.id === donationId)
      if (donation) donation.status = 'claimed'
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'claimed' }),
    })
  })

  await page.goto('/donations')

  await expect(page.getByText('Rice')).toBeVisible()
  await page.getByRole('button', { name: 'Claim' }).click()
  await expect(page.getByRole('button', { name: 'Claimed' })).toBeVisible()
})

test('ST7: privacy settings toggle saves correctly', async ({ page }) => {
  await setAuthState(page)

  await page.route(`${API_BASE}/auth/settings/`, async (route) => {
    const method = route.request().method()

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          full_name: 'Test User',
          email: 'test.user@example.com',
          is_2fa_enabled: false,
          is_donations_public: true,
          email_notifications: true,
          push_notifications: true,
        }),
      })
      return
    }

    if (method === 'PATCH') {
      const body = route.request().postData()
      expect(body).toMatch(/name="is_donations_public"[\s\S]*?false/)
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          full_name: 'Test User',
          email: 'test.user@example.com',
          is_2fa_enabled: false,
          is_donations_public: false,
          email_notifications: true,
          push_notifications: true,
        }),
      })
      return
    }
  })

  await page.goto('/settings')
  await expect(page.getByRole('heading', { name: 'Privacy & Security Settings' })).toBeVisible()

  const listingsToggle = page.getByRole('button', { name: 'Make food listings public' })
  await listingsToggle.click()

  await expect(listingsToggle).toHaveAttribute('aria-pressed', 'false')
})

test('ST8: analytics shows food saved and supports date/category filters', async ({ page }) => {
  await setAuthState(page)

  await page.route(`${API_BASE}/analytics/`, async (route) => {
    const url = new URL(route.request().url())
    const period = url.searchParams.get('period')
    const category = url.searchParams.get('category')

    expect(['all', '7d', '30d', '90d']).toContain(period)
    expect(['', 'vegetables']).toContain(category)

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        total_items: 12,
        items_used: 7,
        total_donated: 4,
        food_saved_from_waste: 11,
        expiring_soon: 2,
        weekly_trend: [{ week: '2026-08-01', count: 3 }],
        items_logged_trend: [{ week: '2026-08-01', count: 5 }],
        category_breakdown: [{ category: 'vegetables', count: 2 }],
      }),
    })
  })

  await page.goto('/analytics')

  await expect(page.getByText('Food Saved From Waste')).toBeVisible()
  await expect(page.getByText('11')).toBeVisible()
  await page.locator('select').nth(0).selectOption('vegetables')
  await page.locator('select').nth(1).selectOption('30d')

  await expect(page.getByText('Number of Donations')).toBeVisible()
})

test('ST9: filter donations by category', async ({ page }) => {
  await setAuthState(page)

  await page.route(`${API_BASE}/donations/`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 1,
          status: 'available',
          pickup_info: 'Central block',
          food_item_detail: {
            name: 'Carrots',
            quantity: '2',
            unit: 'kg',
            category: 'Fresh',
            expiry_date: '2026-07-28',
            image: null,
          },
        },
        {
          id: 2,
          status: 'available',
          pickup_info: 'West block',
          food_item_detail: {
            name: 'Canned Beans',
            quantity: '4',
            unit: 'cans',
            category: 'Canned',
            expiry_date: '2027-01-10',
            image: null,
          },
        },
      ]),
    })
  })

  await page.goto('/donations')

  await page.getByLabel('Fresh').check()

  await expect(page.getByText('Carrots')).toBeVisible()
  await expect(page.getByText('Canned Beans')).toHaveCount(0)
})