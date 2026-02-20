import TurndownService from "turndown"
import wikipedia from "wikipedia"

import type { FetchWikipediaBiographyOperation } from "@/core/application/port/operation/fetchWikipediaBiography"
import { failAsExternalServiceError, failAsNotFoundError, succeed } from "@/core/util/appResult"

export const fetchWikipediaBiography: FetchWikipediaBiographyOperation = async (parameters) => {
  try {
    wikipedia.setLang(parameters.language)

    const searchResults = await wikipedia.search(parameters.personName, { limit: 1 })
    if (searchResults.results.length === 0) {
      return failAsNotFoundError(`Wikipedia page not found for: ${parameters.personName}`)
    }

    const page = await wikipedia.page(searchResults.results[0].title)
    const html = await page.html()
    const url = page.fullurl

    const turndownService = new TurndownService()
    const markdown = turndownService.turndown(html)

    return succeed({
      title: page.title,
      markdown,
      url,
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return failAsNotFoundError(`Wikipedia page not found for: ${parameters.personName}`, error)
    }
    const message = error instanceof Error ? error.message : String(error)
    return failAsExternalServiceError(message, error)
  }
}
