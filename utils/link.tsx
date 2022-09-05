
import { useState, useEffect } from "react"
import { useRouter } from "next/router";

function useLink(): void {
  const router = useRouter();
  useEffect(() => {
    const handleLinks = (e:any) => {
      e.preventDefault();
      router.push(e.target.href || '/');
    }
    var elements = document.getElementsByTagName('a');
    for(var i = 0, len = elements.length; i < len; i++) {
        elements[i].addEventListener("click", handleLinks)
    }
    return () => {
      for(var i = 0, len = elements.length; i < len; i++) {
        elements[i].removeEventListener("click", handleLinks)
      }
    }
  })
}

export default useLink
