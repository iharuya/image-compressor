import imageCompression from "browser-image-compression"
import { useState } from "react"

import "./App.css"

function App() {
	const [form, setForm] = useState({
		maxSizeMB: 1,
		maxWidthOrHeight: 1024,
		file: null,
	})
	const [compressStatus, setCompressStatus] = useState({
		progress: null,
		filename: null,
		inputSize: null,
		outputSize: null,
		inputUrl: null,
		outputUrl: null,
		errorMessage: "",
	})

	function setCompressStatusWrap(updateObj) {
		setCompressStatus((prevStatus) => ({
			...prevStatus,
			...updateObj,
		}))
	}

	async function compressImage(event) {
		event.preventDefault()
		if (!form.file) return
		const input = form.file
		const options = {
			maxSizeMB: form.maxSizeMB,
			maxWidthOrHeight: form.maxWidthOrHeight,
			useWebWorker: false,
			onProgress: (percent) => {
				console.log(percent)
				setCompressStatusWrap({ progress: percent })
			},
		}
		try {
			const output = await imageCompression(input, options)
			setCompressStatusWrap({
				filename: input.name,
				outputSize: output.size,
				outputUrl: URL.createObjectURL(output),
				errorMessage: "",
				progress: null,
				inputSize: input.size,
				inputUrl: URL.createObjectURL(input),
			})
		} catch (error) {
			setCompressStatusWrap({
				errorMessage: error.message,
			})
		}
	}

	function handleForm(event) {
		const { name, value, type, files } = event.target
		setForm((prevForm) => {
			return {
				...prevForm,
				[name]: type === "file" ? files[0] : value,
			}
		})
	}

	function printDataSize(num) {
		const mb = num / 1024 / 1024
		return `${mb.toFixed(2)} MB`
	}

	function compressedFilename(filename) {
		const name = filename.replace(/\.[0-9a-z]+$/g, "")
		const ext = filename.match(/\.[0-9a-z]+$/g, "")
		return `${name}-compressed${ext}`
	}

	return (
		<main id="app">
			<div className="container py-5">
				<h1>Image compressor</h1>
				<div className="row">
					<div className="col col-12 col-md-6">
						<form onSubmit={compressImage}>
							<h2>Input</h2>
							<div className="mb-3">
								<label
									htmlFor="sourceFile"
									className="form-label"
								>
									Select an image file
								</label>
								<input
									type="file"
									id="sourceFile"
									name="file"
									className="form-control"
									accept="image/*"
									onChange={handleForm}
									required
								/>

								{form.file && (
									<div className="py-3">
										<img
											src={URL.createObjectURL(form.file)}
											className="img-fluid"
										/>
										<p className="mb-0">
											Source image size:{" "}
											{printDataSize(form.file.size)}
										</p>
									</div>
								)}
							</div>
							<div className="mb-3">
								<label
									htmlFor="maxSizeMB"
									className="form-label"
								>
									Max size (MB)
								</label>
								<input
									type="number"
									id="maxSizeMB"
									name="maxSizeMB"
									className="form-control"
									value={form.maxSizeMB}
									onChange={handleForm}
								/>
							</div>
							<div className="mb-3">
								<label
									htmlFor="maxWidthOrHeight"
									className="form-label"
								>
									Max width or height
								</label>
								<input
									type="number"
									id="maxWidthOrHeight"
									name="maxWidthOrHeight"
									className="form-control"
									value={form.maxWidthOrHeight}
									onChange={handleForm}
									min="128"
								/>
							</div>

							{compressStatus.progress && (
								<div className="progress">
									<div
										className="progress-bar"
										role="progressbar"
										aria-valuemin="0"
										aria-valuemax="1"
										aria-valuenow={compressStatus.progress}
										style={{
											width:
												compressStatus.progress + "%",
										}}
									></div>
								</div>
							)}

							{compressStatus.errorMessage && (
								<div className="alert alert-danger">
									{compressStatus.errorMessage}
								</div>
							)}

							<div className="d-flex justify-content-center py-3">
								<button
									className="btn btn-primary"
									type="submit"
								>
									Compress
								</button>
							</div>
						</form>
					</div>
					<div className="col col-12 col-md-6">
						<div className="output">
							<h2>Output</h2>
							<ul className="list-group">
								{compressStatus.inputSize !== null && (
									<li className="list-group-item">
										<span>
											Source image size:{" "}
											{printDataSize(
												compressStatus.inputSize
											)}
										</span>
									</li>
								)}
								{compressStatus.outputSize !== null && (
									<li className="list-group-item">
										<span>
											Compressed image size:{" "}
											{printDataSize(
												compressStatus.outputSize
											)}
										</span>
									</li>
								)}
								{compressStatus.outputUrl && (
									<li className="list-group-item">
										<p>Compressed image</p>
										<img
											src={compressStatus.outputUrl}
											className="img-fluid"
										/>
										<div className="d-flex justify-content-center py-2">
											<a
												href={compressStatus.outputUrl}
												download={compressedFilename(
													compressStatus.filename
												)}
												className="btn btn-success"
											>
												Download
											</a>
										</div>
									</li>
								)}
							</ul>
						</div>
					</div>
				</div>
			</div>
		</main>
	)
}

export default App
