import { prisma } from '@/lib/prisma'
import { SettingType } from '@prisma/client'
import { decrypt } from '@/lib/security/encryption'

export async function getSetting<T>(key: string): Promise<T | null> {
  const setting = await prisma.settings.findUnique({
    where: { key },
  })

  if (!setting) return null

  // Decrypt sensitive values
  if (setting.type === SettingType.SECURITY) {
    return decryptSettingValue(setting.value)
  }

  return setting.value as T
}

export async function setSetting(
  key: string,
  value: any,
  type: SettingType = SettingType.GENERAL
) {
  return prisma.settings.upsert({
    where: { key },
    update: { value, type },
    create: { key, value, type },
  })
}

export async function deleteSetting(key: string) {
  return prisma.settings.delete({
    where: { key },
  })
}

async function decryptSettingValue(value: any): Promise<any> {
  if (typeof value === 'object') {
    const decrypted: any = {}
    for (const [key, val] of Object.entries(value)) {
      decrypted[key] = await decryptSettingValue(val)
    }
    return decrypted
  }

  if (typeof value === 'string' && value.startsWith('encrypted:')) {
    return decrypt(value.slice(10))
  }

  return value
}