// Copyright © LFV

import { MarkdownString } from 'vscode'
import { AnnotationType } from '../enums/AnnotationType'
import { RequirementsToolOutput, WorkspaceAnnotation } from '../types'
import { ensureStringArray, stringifyRevision } from '../util'

export namespace Markdown {
    export function fromRequirement(urn: string, reqstoolData: RequirementsToolOutput, workspaceKey: string) {
        const { id, title, significance, revision, description, rationale, categories } = reqstoolData.requirements[urn]
        const svcLinks = ensureStringArray(reqstoolData.svcs_from_req?.[urn]).map((svc) =>
            link(svc, AnnotationType.svc, workspaceKey)
        )
        const lines = [
            `### ${title}`,
            `\`${id}\` \`${significance}\` \`${stringifyRevision(revision)}\``,
            '---',
            `${description}`,
            '---',
            `${rationale}`,
            '---',
            categories.join(', '),
            '---',
            svcLinks.join(', '),
        ]
        const markdownText = new MarkdownString(lines.join('\n\n'))
        markdownText.isTrusted = true
        return markdownText
    }

    export function fromSvc(urn: string, reqstoolData: RequirementsToolOutput, workspaceKey: string) {
        const { id, title, description, verification, instructions, revision, requirement_ids } = reqstoolData.svcs[urn]
        const mvrLinks = ensureStringArray(reqstoolData.mvrs_from_svc?.[urn]).map((svc) =>
            link(svc, AnnotationType.svc, workspaceKey)
        )
        const lines = [
            `### ${title}`,
            `\`${id}\` \`${verification}\` \`${stringifyRevision(revision)}\``,
            '---',
            description,
            '---',
            instructions,
            '---',
            requirement_ids.map((req) => link(req, AnnotationType.requirement, workspaceKey)).join(', '),
            '---',
            mvrLinks.join(', '),
        ]
        const markdownText = new MarkdownString(lines.join('\n\n'))
        markdownText.isTrusted = true
        return markdownText
    }

    /**
     * Creates a markdown link that is hooked up to the extensions hoverClickHandler
     */
    function link(urn: string, type: AnnotationType, workspaceKey: string) {
        return `[${urn}](command:reqstool-vscode-extension.hoverClickHandler?${encodeUrn(urn, type, workspaceKey)})`
    }

    /**
     * The data sent to a vscode command needs to be encoded in a specific way.
     */
    function encodeUrn(urn: string, type: AnnotationType, workspaceKey: string) {
        const data: WorkspaceAnnotation = { urn, type, workspaceKey }
        return encodeURIComponent(JSON.stringify(data))
    }
}
