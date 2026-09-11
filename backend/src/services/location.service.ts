import prisma from "../utils/prisma";
import { ApiError } from "../utils/ApiError";
import type {
  CreateLocationInput,
  UpdateLocationInput,
} from "../types/location.types";

export async function createLocation(input: CreateLocationInput) {
  return prisma.location.create({
    data: {
      name: input.name,
      building: input.building,
      room: input.room,
      description: input.description ?? null,
    },
  });
}

export async function listLocations() {
  const locations = await prisma.location.findMany({
    include: {
      _count: {
        select: {
          assets: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return locations.map(({ _count, ...location }) => ({
    ...location,
    assetCount: _count.assets,
  }));
}

export async function getLocationById(id: string) {
  const location = await prisma.location.findUnique({
    where: { id },
    include: {
      assets: true,
      _count: {
        select: {
          assets: true,
        },
      },
    },
  });

  if (!location) {
    throw new ApiError(404, "Location not found");
  }

  const { _count, ...rest } = location;

  return {
    ...rest,
    assetCount: _count.assets,
  };
}

export async function updateLocation(
  id: string,
  input: UpdateLocationInput
) {
  const existing = await prisma.location.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(404, "Location not found");
  }

  return prisma.location.update({
    where: { id },
    data: {
      name: input.name,
      building: input.building,
      room: input.room,
      description: input.description,
    },
  });
}

// Blocked while assets are still assigned, to avoid
// silently orphaning tracked assets.
export async function deleteLocation(id: string) {
  const existing = await prisma.location.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(404, "Location not found");
  }

  const assetCount = await prisma.asset.count({
    where: { locationId: id },
  });

  if (assetCount > 0) {
    throw new ApiError(
      409,
      "Cannot delete location while assets are assigned to it"
    );
  }

  await prisma.location.delete({
    where: { id },
  });
}