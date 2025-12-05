"use client";

import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "./ui/skeleton";

interface FilterCarouselProps {
  data: { label: string; value: string }[];
  value?: string | null;
  onSelect: (value: string | null) => void;
  isLoading?: boolean;
}

export const FilterCarousel = ({
  data,
  value,
  onSelect,
  isLoading = false,
}: FilterCarouselProps) => {
  const handleSelect = (val: string) => {
    onSelect(val === value ? null : val);
  };

  return (
    <Carousel
      className="w-full px-10"
      opts={{
        slidesToScroll: 2,
      }}
    >
      <CarouselContent className="relative w-full ">
        {isLoading &&
          Array.from({ length: 12 }).map((_, idx) => (
            <CarouselItem key={idx} className="flex-none">
              <Skeleton className="h-full w-[100px] rounded-lg px-3 py-1 text-sm font-semibold">
                &nbsp;
              </Skeleton>
            </CarouselItem>
          ))}
        {!isLoading && (
          <CarouselItem className="flex-none">
            <Badge
              variant={!value ? "default" : "secondary"}
              className="rounded-lg px-3 py-1 text-sm cursor-pointer"
              onClick={() => handleSelect("")}
            >
              All
            </Badge>
          </CarouselItem>
        )}
        {!isLoading &&
          data.map((item) => (
            <CarouselItem key={item.value} className="flex-none">
              <Badge
                variant={item.value === value ? "default" : "secondary"}
                className="rounded-lg px-3 py-1 text-sm cursor-pointer"
                onClick={() => handleSelect(item.value)}
              >
                {item.label}
              </Badge>
            </CarouselItem>
          ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-0 z-20" />
      <CarouselNext className="absolute right-0 z-20" />
    </Carousel>
  );
};

export default FilterCarousel;
